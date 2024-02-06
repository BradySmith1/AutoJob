use actix_web::{HttpResponse, post};
use actix_web::cookie::Cookie;
use crate::model::login_model::LoginRequest;
use actix_web::web::Data;
use mongodb::bson::doc;
use crate::model::user_model::User;
use crate::repository::mongodb_repo::MongoRepo;
use argon2::{
    password_hash::{
        PasswordHash, PasswordVerifier
    },
    Argon2
};
use rand::{distributions::Alphanumeric, Rng};
use crate::utils::jwt::encode_token;

#[post("/user/auth")]
pub async fn authenticate_user(cache: Data<MongoRepo<User>>, user: String, secret: Data<String>) ->
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
    let returned_user: &User = match returned_user.get(0){
        Some(user) => user,
        _ => return HttpResponse::BadRequest().body("Invalid Email or Password")
    };
    let parsed_hash = PasswordHash::new(&returned_user.hashed_password).unwrap();
    let result = Argon2::default().verify_password(json.password.as_bytes(), &parsed_hash);
    if result.is_err(){
        return HttpResponse::BadRequest().body("Invalid Email or Password");
    }
    let id = returned_user.id.unwrap().to_string();
    let refresh_token = generate_rand_string();
    let jwt_token = encode_token(id, secret).await;
    HttpResponse::Ok().cookie(
        Cookie::build("AutoJobRefresh", refresh_token)
            .domain("localhost") //Todo need to change this come deployment time
            .path("/refresh_token")
            .secure(true)
            .http_only(true)
            .finish()
    ).body(jwt_token)
}

fn generate_rand_string() -> String {
    rand::thread_rng()
        .sample_iter(&Alphanumeric)
        .take(32)
        .map(char::from)
        .collect()
}

