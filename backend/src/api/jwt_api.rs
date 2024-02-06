use actix_web::{HttpResponse, post};
use actix_web::web::Data;
use jsonwebtoken::{TokenData, errors::Error as JwtError, decode, DecodingKey, Validation, Algorithm};
use mongodb::bson::doc;
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
    let mut stored_token: JWT = JWT{
        id: None,
        userid: parsed_token.claims.userid.clone(),
        issuerid: parsed_token.claims.issuerid.clone(),
        exp: parsed_token.claims.exp.clone(),
        jwt_raw: new_token
    };
    let doc = doc! {"userid" : parsed_token.claims.userid.clone()};
    let token_found = match db.get_documents_by_attribute(doc).await{
        Ok(tokens) => {tokens}
        Err(_) => return HttpResponse::InternalServerError()
            .body("Could not retrieve token from collection. Check if MongoDB \
                is running")
    };
    let token_found = token_found.get(0);
    if token_found.is_some(){
        stored_token.id = token_found.unwrap().id.clone();
        let user = db.update_document(&token_found.unwrap().id.expect("Failed to get id").to_string
        (),
                                      stored_token
            .clone()).await.expect("MONGODB not running");
        return HttpResponse::Ok().json(user);
    }else{
        let user = db.create_document(stored_token).await.expect("MONGODB not running");
        return HttpResponse::Ok().json(user);
    }
}