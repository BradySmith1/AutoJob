use actix_web::{HttpRequest, HttpResponse, post};
use actix_web::cookie::{Cookie, SameSite};
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
use chrono::Utc;
use rand::{distributions::Alphanumeric, Rng};
use reqwest::Response;
use serde_derive::{Deserialize, Serialize};
use crate::model::refresh_model::RefreshToken;
use crate::utils::jwt::encode_token;

#[derive(Serialize, Deserialize)]
struct AuthResponse {
    jwt_token: String
}

#[post("/user/auth")]
pub async fn authenticate_user(req: HttpRequest, tokens: Data<MongoRepo<RefreshToken>>,cache:
Data<MongoRepo<User>>, user:
String,
                               secret: Data<String>) -> HttpResponse{
    let cookie = req.cookie("AutoJobRefresh");
    if cookie.is_some() {
        let doc = doc! {"refresh_token" : cookie.unwrap().value()};
        let result = match tokens.get_documents_by_attribute(doc).await{
            Ok(res) => {res}
            Err(_) => {return HttpResponse::InternalServerError().body("Could not add document to \
            the jobEstimate collection. Check if MongoDB is running")}
        };
        let result = match result.get(0){
            None => {return HttpResponse::BadRequest().body("Cookie provided is invalid, please \
            re-authenticate")}
            Some(res) => {res}
        };
        let exp = result.exp;
        if exp <= Utc::now().timestamp() as usize {
            return HttpResponse::BadRequest().body("Refresh token has expired. Please re-\
            authenticate")
        }
        //todo Account for logouts
        let refresh_token = generate_rand_string();
        match tokens.update_document(result.user.clone(), RefreshToken{
            id: None,
            user: result.user.clone(),
            jwt_token: result.jwt_token.clone(),
            exp,
            refresh_token: refresh_token.clone(),
        }).await{
            Ok(_) => {}
            Err(_) => return HttpResponse::InternalServerError()
                .body("Could not add document to the jobEstimate collection. Check if MongoDB \
                is running")
        };
        return success_login_response(refresh_token, result.jwt_token.clone());
    }else{
        //LoginRequest struct includes username and password
        let json: LoginRequest = match serde_json::from_str(&user){
            Ok(user_auth) => user_auth,
            Err(_) => return HttpResponse::BadRequest().body("Please re-Authenticate with username \
        and password")
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
        let (jwt_token, exp) = encode_token(id.clone(), secret).await;
        let response = send_jwt(jwt_token.clone()).await;
        if response.is_err() {
            println!("JWT never reached backend. Check if backend it running");
            return HttpResponse::InternalServerError().body("Servers are currently down please try \
        again later")
        }
        tokens.delete_document(returned_user.username.clone()).await.expect("failure to delete \
        documents");
        match tokens.create_document(RefreshToken{
            id: None,
            user: returned_user.username.clone(),
            jwt_token: jwt_token.clone(),
            exp,
            refresh_token: refresh_token.clone(),
        }).await{
            Ok(_) => {}
            Err(_) => {
                println!("Could not add the refresh token to the database, check if mongodb is \
            running");
                return HttpResponse::InternalServerError().body("Servers are currently down please \
                try again later")
            }
        };
        success_login_response(refresh_token, jwt_token)
    }
}

fn success_login_response(refresh_token: String, jwt_token: String) -> HttpResponse{
    HttpResponse::Ok()
        .cookie(
            Cookie::build("AutoJobRefresh", refresh_token)
                .domain("localhost") //TODO frontend domain needs to change when frontend is deployed
                .path("/")
                //.http_only(true)
                .secure(true)
                .same_site(SameSite::None)
                .finish())
        .insert_header(("Access-Control-Allow-Origin", "*"))
        .insert_header(("Access-Control-Allow-Credidentials", "true"))
        .insert_header(("Access-Control-Allow-Headers", "set-cookie"))
        .json(AuthResponse{ jwt_token })
}

async fn send_jwt(jwt: String) -> Result<Response, String> {
    let url = std::env::var("TOKEN_URL").unwrap();
    let client = reqwest::Client::builder()
        .danger_accept_invalid_certs(true)
        .build()
        .unwrap();
    let res = client.post(&url);
    let res = res.json(&AuthResponse { jwt_token: jwt });
    let res = res.timeout(std::time::Duration::from_secs(3));
    let response = match res.send().await{
        Ok(response) => response,
        Err(_) => {
            println!("Error getting web cache. Check if web cache is running");
            return Err("error getting web cache".to_string());
        },
    };
    Ok(response)
}

fn generate_rand_string() -> String {
    rand::thread_rng()
        .sample_iter(&Alphanumeric)
        .take(32)
        .map(char::from)
        .collect()
}

