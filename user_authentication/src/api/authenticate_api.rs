use actix_web::{HttpResponse, post};
use crate::model::login_model::LoginRequest;
use actix_web::web::{Data, Query};
use mongodb::bson::doc;
use crate::model::user_model::User;
use crate::repository::mongodb_repo::MongoRepo;
use argon2::{
    password_hash::{
        rand_core::OsRng,
        PasswordHash, PasswordHasher, PasswordVerifier, SaltString
    },
    Argon2
};

#[post("/user/auth")]
pub async fn authenticate_user(cache: Data<MongoRepo<User>>, user: String) ->
HttpResponse{
    //LoginRequest struct includes username and password
    let json: LoginRequest = match serde_json::from_str(&user){
        Ok(user_auth) => user_auth,
        Err(_) => return HttpResponse::InternalServerError().body("Could not parse the JSON in the \
        http Request")
    };
    let doc = doc!("username" : &json.username);
    let returned_user = match cache.get_documents_by_attribute(doc).await{
        Ok(user) => user,
        Err(_) => return HttpResponse::InternalServerError()
            .body("Could not add document to the jobEstimate collection. Check if MongoDB \
                is running")
    };
    let returned_user = returned_user.get(0).unwrap();
    let parsed_hash = PasswordHash::new(&returned_user.hashed_password).unwrap();
    let result = Argon2::default().verify_password(json.password.as_bytes(), &parsed_hash);
    match result{
        Ok(_) => HttpResponse::Ok().body("Successfully authenticated!"),
        Err(_) => HttpResponse::BadRequest().body("Wrong username or password")
    }
}