use std::future::{Ready, ready};
use actix_web::web::Data;
use chrono::{Duration, Utc};
use actix_web::{web, FromRequest, HttpRequest, http::header::HeaderValue, dev::Payload, Error as ActixWebError, error::ErrorUnauthorized, HttpResponse};
use serde::{ Serialize, Deserialize };
use jsonwebtoken::{
    TokenData,
    Algorithm,
    Validation,
    DecodingKey,
    errors::Error as JwtError,
    decode,
    encode, EncodingKey, Header
};

#[derive(Serialize, Deserialize)]
struct Response{
    message: String,
}

#[derive(Serialize, Deserialize)]
struct Claims {
    userid: String,
    issuerid: String,
    exp: usize,
}

pub async fn encode_token(id: String, secret: Data<String>) -> String {
    let token_exp = std::env::var("TOKENEXP").unwrap().parse::<i64>().unwrap();
    let issuer_token = std::env::var("SYSTOKEN").unwrap();
    let exp: usize = (Utc::now() + Duration::days(token_exp)).timestamp() as usize;
    let claims: Claims = Claims { userid: id, issuerid: issuer_token, exp };
    let token: String = encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(secret.as_str().as_ref()),
    ).unwrap(); //use a match statement to fix this later
    token
}

pub async fn protected_route(auth_token: AuthenticationToken) -> HttpResponse {
    println!("{:#?}", auth_token);
    HttpResponse::Ok().json(Response { message: "Authorized".to_owned() })
}


//EXTRACTOR FOR AUTHENTICATION TOKEN

#[derive(Debug, Serialize, Deserialize)]
pub struct AuthenticationToken {
    userid: String,
    issuerid: String,
    exp: usize,
}

impl FromRequest for AuthenticationToken {
    type Error = ActixWebError;
    type Future = Ready<Result<Self, Self::Error>>;

    fn from_request(req: &HttpRequest, _payload: &mut Payload) -> Self::Future {
        let req = req.clone();

        let authorization_header_option: Option<&HeaderValue> = req.headers().get(actix_web::http::header::AUTHORIZATION);

        // No Header was sent
        if authorization_header_option.is_none() { return ready(Err(ErrorUnauthorized("No authentication token sent!"))); }

        let authentication_token: String = authorization_header_option.unwrap().to_str().unwrap_or("").to_string();

        // Couldn't convert Header::Authorization to String
        if authentication_token.is_empty() { return ready(Err(ErrorUnauthorized("Authentication token has foreign chars!"))) }

        // TODO put secret in app_state
        let secret: &str = &req.app_data::<web::Data<String>>().unwrap();
        // let secret: &str = "secret";

        let token_result: Result<TokenData<Claims>, JwtError> = decode::<Claims>(
            &authentication_token,
            &DecodingKey::from_secret(secret.as_ref()),
            &Validation::new(Algorithm::HS256),
        );

        match token_result {
            Ok(token) => ready(Ok(AuthenticationToken { userid: token.claims.userid, issuerid:
            token.claims.issuerid, exp: token.claims.exp })),
            Err(_e) => ready(Err(ErrorUnauthorized("Invalid authentication token sent!"))),
        }
    }
}
