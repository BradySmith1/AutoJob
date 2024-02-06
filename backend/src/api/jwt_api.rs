use actix_web::{HttpResponse, post};
use actix_web::web::Data;
use jsonwebtoken::{TokenData, errors::Error as JwtError, decode, DecodingKey, Validation, Algorithm};
use crate::model::jwt_model::{Claims, JSONToken, JWT};
use crate::repository::mongodb_repo::MongoRepo;

#[post("/token")]
pub async fn store_token(db: Data<MongoRepo<JWT>>, new_token: String, secret: Data<String>) ->
                                                                                       HttpResponse{
    let new_token: JSONToken = match serde_json::from_str(&new_token){
        Ok(parsed_json) => parsed_json,
        Err(_) => {
            println!("Incorrect JSON object format from HTTPRequest.");
            return HttpResponse::InternalServerError()
                .body("Incorrect JSON object format from HTTPRequest Post request.")
        },
    };
    let new_token = new_token.jwt_token;
    let parsed_token: Result<TokenData<Claims>, JwtError> = decode::<Claims>(
        &new_token,
        &DecodingKey::from_secret(secret.as_str().as_ref()),
        &Validation::new(Algorithm::HS256),
    );
    let parsed_token = match parsed_token {
        Ok(token) => token,
        Err(e) => return HttpResponse::Unauthorized().body(e.to_string()),
    };
    let auth_server_token = std::env::var("AUTHSERVERTOKEN").unwrap();
    if !(&parsed_token.claims.issuerid.eq(&auth_server_token)){
        return HttpResponse::Unauthorized().body("Token recieved is not from a valid sender. \
        your IP has been permanently blocked");
    }
    let stored_token: JWT = JWT{
        userid: parsed_token.claims.userid,
        issuerid: parsed_token.claims.issuerid,
        exp: parsed_token.claims.exp,
        jwt_raw: new_token
    };
    let returned_token = db.create_document(stored_token).await;
    match returned_token {
        Ok(user) => return HttpResponse::Ok().json(user),
        Err(_) => HttpResponse::InternalServerError()
            .body("Could not add document to the token collection. Check if MongoDB \
                is running")
    }
}