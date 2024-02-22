use actix_web::web::Data;
use chrono::{Duration, Utc};
use serde::{ Serialize, Deserialize };
use jsonwebtoken::{
    encode, EncodingKey, Header
};

/// This struct holds the claims for the JWT token.
#[derive(Serialize, Deserialize)]
struct Claims {
    userid: String,
    issuerid: String,
    exp: usize,
}

/// This function encodes a token using the jsonwebtoken crate.
/// It takes a user id and a secret key as input and returns a token and expiration time.
///
/// # Arguments
/// * `id` - A string that holds the user id
/// * `secret` - A Data object that holds the secret key
///
/// # Returns
/// A tuple containing the token and expiration time.
pub async fn encode_token(id: String, secret: Data<String>) -> (String, usize) {
    let token_exp = std::env::var("TOKENEXP").unwrap().parse::<i64>().unwrap();
    let issuer_token = std::env::var("SYSTOKEN").unwrap();
    let exp: usize = (Utc::now() + Duration::days(token_exp)).timestamp() as usize;
    let claims: Claims = Claims { userid: id, issuerid: issuer_token, exp };
    let token: String = encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(secret.as_str().as_ref()),
    ).unwrap(); //use a match statement to fix this later
    (token, exp)
}