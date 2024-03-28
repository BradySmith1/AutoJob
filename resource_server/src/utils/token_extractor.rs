use crate::model::jwt_model::JWT;
use crate::repository::mongodb_repo::MongoRepo;
use actix_web::{
    dev::Payload, error::ErrorUnauthorized, http::header::HeaderValue, web, Error as ActixWebError,
    Error, FromRequest, HttpRequest,
};
use chrono::Utc;
use jsonwebtoken::{
    decode, errors::Error as JwtError, Algorithm, DecodingKey, TokenData, Validation,
};
use mongodb::bson::doc;
use serde::{Deserialize, Serialize};
use std::future::Future;
use std::pin::Pin;

#[derive(Serialize, Deserialize)]
struct Claims {
    userid: String,
    issuerid: String,
    exp: usize,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AuthenticationToken {
    pub userid: String,
    issuerid: String,
    exp: usize,
}

impl FromRequest for AuthenticationToken {
    type Error = ActixWebError;
    type Future = Pin<Box<dyn Future<Output = Result<Self, Self::Error>>>>;
    fn from_request(req: &HttpRequest, _payload: &mut Payload) -> Self::Future {
        let req = req.clone();
        Box::pin(async move {
            let authorization_header_option: Option<&HeaderValue> =
                req.headers().get(actix_web::http::header::AUTHORIZATION);

            // No Header was sent
            if authorization_header_option.is_none() {
                return Err(ErrorUnauthorized("No authentication token sent!"));
            }

            let authentication_token: String = authorization_header_option
                .unwrap()
                .to_str()
                .unwrap_or("")
                .to_string();

            // Couldn't convert Header::Authorization to String
            if authentication_token.is_empty() {
                return Err(ErrorUnauthorized("Authentication token has foreign chars!"));
            }

            let secret: &str = &req.app_data::<web::Data<String>>().unwrap();

            let token_result: Result<TokenData<Claims>, JwtError> = decode::<Claims>(
                &authentication_token,
                &DecodingKey::from_secret(secret.as_ref()),
                &Validation::new(Algorithm::HS256),
            );

            if token_result.is_err() {
                return Err(ErrorUnauthorized("Invalid authentication token sent!"));
            }

            let token = token_result.unwrap();
            let auth_token = AuthenticationToken {
                userid: token.claims.userid.clone(),
                issuerid: token.claims.issuerid,
                exp: token.claims.exp,
            };
            let result = check_auth_mongodb(auth_token.clone()).await;
            return match result {
                Ok(_) => Ok(auth_token),
                Err(err) => Err(err),
            };
        })
    }
}

async fn check_auth_mongodb(token: AuthenticationToken) -> Result<String, Error> {
    let db: MongoRepo<JWT> = MongoRepo::init("tokens", "admin").await;
    let doc = doc! {"userid" : &token.userid};
    let result = db.get_documents_by_attribute(doc).await.unwrap();
    let stored_token = match result.get(0) {
        None => return Err(ErrorUnauthorized("No JWT Matches in DB")),
        Some(token) => token,
    };
    if stored_token.userid == token.userid
        && stored_token.issuerid == token.issuerid
        && stored_token.exp > (Utc::now().timestamp() as usize)
    {
        return Ok("Token is authorized".to_string());
    } else {
        return Err(ErrorUnauthorized(
            "Found token in db does not align with supplied JWT",
        ));
    }
}
