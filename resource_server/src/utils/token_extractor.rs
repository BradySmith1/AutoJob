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

/// The claims struct is used to store the JWT claims.
#[derive(Serialize, Deserialize)]
struct Claims {
    userid: String,
    issuerid: String,
    exp: usize,
}

/// The AuthenticationToken struct is used to store the JWT token.
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AuthenticationToken {
    pub userid: String,
    issuerid: String,
    exp: usize,
}

/// The FromRequest trait is used to extract the JWT token from the request header.
impl FromRequest for AuthenticationToken {
    // The Error type is used to represent the error that might occur when extracting the token.
    type Error = ActixWebError;
    // The Future type is used to represent the result of the extraction process.
    type Future = Pin<Box<dyn Future<Output = Result<Self, Self::Error>>>>;

    /// The from_request function is used to extract the JWT token from the request header.
    /// It returns a Future object containing the result of the extraction process.
    /// # Parameters
    /// req: A reference to the HttpRequest object.
    /// payload: A reference to the Payload object.
    /// # Returns
    /// A Future object containing the result of the extraction process.
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

            // the secret for the JWT token
            let secret: &str = &req.app_data::<web::Data<String>>().unwrap();

            // Decode the JWT token
            let token_result: Result<TokenData<Claims>, JwtError> = decode::<Claims>(
                &authentication_token,
                &DecodingKey::from_secret(secret.as_ref()),
                &Validation::new(Algorithm::HS256),
            );

            // Check if the token is valid
            if token_result.is_err() {
                return Err(ErrorUnauthorized("Invalid authentication token sent!"));
            }

            let token = token_result.unwrap();
            // Create an AuthenticationToken object
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

/// The check_auth_mongodb function is used to check the validity of the JWT token.
///
/// # Parameters
///
/// * `token` - An AuthenticationToken object containing the JWT token.
///
/// # Returns
///
/// A Result object containing the result of the operation. If the token is valid,
/// it returns an Ok result with a message.
/// If the token is invalid, it returns an Err result with an error message.
async fn check_auth_mongodb(token: AuthenticationToken) -> Result<String, Error> {
    // Initialize the MongoDB repository
    let db: MongoRepo<JWT> = MongoRepo::init("tokens", "admin").await;
    let doc = doc! {"userid" : &token.userid};
    // Get the token from the database
    let result = db.get_documents_by_attribute(doc).await.unwrap();
    let stored_token = match result.get(0) {
        None => return Err(ErrorUnauthorized("No JWT Matches in DB")),
        Some(token) => token,
    };
    // Check if the token is valid
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
