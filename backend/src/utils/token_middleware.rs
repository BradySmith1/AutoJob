use std::future::{ ready, Ready };
use actix_web::{HttpRequest, FromRequest, web, dev::{forward_ready, Service, ServiceRequest, ServiceResponse, Transform}, Error as ActixWebError, Error, HttpResponse};
use actix_web::error::ErrorUnauthorized;
use actix_web::http::header::HeaderValue;
use futures_util::future::LocalBoxFuture;
use jsonwebtoken::{Algorithm, decode, DecodingKey, errors::Error as JwtError, TokenData,
                   Validation};
use mongodb::bson::doc;
use serde::{ Serialize, Deserialize };
use crate::model::jwt_model::{Claims, JWT};
use crate::repository::mongodb_repo::MongoRepo;
use chrono::Utc;
use tokio::runtime::Runtime;

#[derive(Serialize, Deserialize, Debug)]
pub struct AuthenticationBody {
    token: String,
}


#[derive(Debug, Serialize, Deserialize)]
pub struct AuthenticationToken {
    userid: String,
    issuerid: String,
    exp: usize,
}

pub struct Protected;

// Transfom "transforms" a service by wrapping it in another service.
impl<S, B> Transform<S, ServiceRequest> for Protected
    where
        S: Service<ServiceRequest, Response = ServiceResponse<B>, Error = ActixWebError>,
        S::Future: 'static,
        B: 'static,
{
    type Response = ServiceResponse<B>;
    type Error = ActixWebError;
    // indicates an error that might occur when creating the middleware instance
    type Transform = ProtectedMiddleware<S>;
    type InitError = ();
    type Future = Ready<Result<Self::Transform, Self::InitError>>;

    fn new_transform(&self, service: S) -> Self::Future {
        ready(Ok(ProtectedMiddleware { service }))
    }
}





pub struct ProtectedMiddleware<S> {
    service: S,
}

impl<S, B> Service<ServiceRequest> for ProtectedMiddleware<S>
    where
        S: Service<ServiceRequest, Response = ServiceResponse<B>, Error = ActixWebError>,
        S::Future: 'static,
        B: 'static,
{
    type Response = ServiceResponse<B>;
    type Error = ActixWebError;
    type Future = LocalBoxFuture<'static, Result<Self::Response, Self::Error>>;

    forward_ready!(service);

    fn call(&self, req: ServiceRequest) -> Self::Future {
        // let rt = Runtime::new().unwrap();
        // let http_req = req.request().clone();
        // let future = check_authorization(&http_req);
        // let res = rt.block_on(future);
        // if check_protected(&http_req) == true && res.is_err(){
        //     Box::pin(async move {
        //
        //     })
        // }else{
        //     let fut = self.service.call(req);
        //     Box::pin(async move {
        //         let res = fut.await?;
        //
        //         Ok(res)
        //     })
        // }
        println!("Hi from start. You requested: {}", req.path());

        let fut = self.service.call(req);

        Box::pin(async move {
            let res = fut.await?;

            // let body = res.clone().into_body();
            // let (http_req, payload): (&HttpRequest, &Payload) = res.parts();
            // let auth_body: web::Json<AuthenticationBody> = web::Json::<AuthenticationBody>::from_request(http_req, &mut *payload).await.unwrap();

            println!("Hi from response");
            Ok(res)
        })

    }
}

fn check_protected(req: &HttpRequest) -> bool{
    let path = req.path();
    let unprotected_paths = ["/user"]; //grow this array as unprotected routes are added
    for paths in unprotected_paths {
        if path.eq(paths) {
            return true;
        }
    }
    return false;
}

async fn check_authorization(req: &HttpRequest) -> Result<String, Error> {
    let req = req.clone();
    let authorization_header_option: Option<&HeaderValue> = req.headers().get(actix_web::http::header::AUTHORIZATION);

    // No Header was sent
    if authorization_header_option.is_none() { return Err(ErrorUnauthorized("No authentication token sent!")); }

    let authentication_token: String = authorization_header_option.unwrap().to_str().unwrap_or("").to_string();

    // Couldn't convert Header::Authorization to String
    if authentication_token.is_empty() { return Err(ErrorUnauthorized("Authentication token has foreign chars!")) }

    // TODO put secret in app_state
    let secret: &str = &req.app_data::<web::Data<String>>().unwrap();
    // let secret: &str = "secret";

    let token_result: Result<TokenData<Claims>, JwtError> = decode::<Claims>(
        &authentication_token,
        &DecodingKey::from_secret(secret.as_ref()),
        &Validation::new(Algorithm::HS256),
    );

    if token_result.is_err() {
        return Err(ErrorUnauthorized("Invalid authentication token sent!"));
    }

    let token = token_result.unwrap();
    let result = check_auth_mongodb(AuthenticationToken { userid: token.claims.userid,
        issuerid: token.claims.issuerid, exp: token.claims.exp }).await;
    match result {
        Ok(_) => {return Ok("Token is authorized".to_string())}
        Err(err) => {Err(err)}
    }
}

async fn check_auth_mongodb(token: AuthenticationToken) -> Result<String, Error> {
    let db: MongoRepo<JWT> = MongoRepo::init("tokens", "admin").await; //TODO not correct
    // implementation
    let obj_id = mongodb::bson::oid::ObjectId::parse_str(&token.userid).unwrap();
    let doc = doc! {"_id" : obj_id};
    let result = db.get_documents_by_attribute(doc).await.unwrap();
    let stored_token = match result.get(0){
        None => {return Err(ErrorUnauthorized("No JWT Matches in DB"))}
        Some(token) => {token}
    };
    if stored_token.userid == token.userid && stored_token.issuerid == token.issuerid &&
        stored_token.exp != ((Utc::now()).timestamp() as usize) {
        return Ok("Token is authorized".to_string());
    }else{
        return Err(ErrorUnauthorized("Found token in db does not align with supplied JWT"))
    }
}
