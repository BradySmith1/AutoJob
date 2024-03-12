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


/// Represents a login response. Holds the JWT token in the form of a string.
#[derive(Serialize, Deserialize)]
struct AuthResponse {
    jwt_token: String,
    username: String,
    user_id: String,
}


///Main function for authenticating users. Either authenticates a user with a refresh token or a
/// username and password.
///
/// # Parameters
/// req : A HttpRequest object representing the HTTP request.
/// tokens : A Data object containing a MongoDB repository (MongoRepo) for refresh token data storage.
/// cache : A Data object containing a MongoDB repository (MongoRepo) for user data storage.
/// user : A string representing the username and password of the user.
/// secret : A Data object containing a string representing the secret key for the JWT token.
///
/// # Returns
/// An HttpResponse representing the result of the operation. If the user is authenticated successfully,
/// it returns an HTTP 200 OK response with the JWT token. If there's an error during the authentication
/// process, it returns an HTTP 500 Internal Server Error response with an error message.
#[post("/user/auth")]
pub async fn authenticate_user(req: HttpRequest, tokens: Data<MongoRepo<RefreshToken>>,cache:
Data<MongoRepo<User>>, user: String, secret: Data<String>) -> HttpResponse{
    let cookie = req.cookie("AutoJobRefresh");
    return if cookie.is_some() {
        check_cookie(&cookie.unwrap(), &tokens).await
    }else{
        check_username_password(user, &cache, &tokens, secret).await
    }
}

/// This function checks the refresh token to see if it is valid. If it is, it generates a new token
/// and refresh token and updates the database with the new token.
///
/// # Parameters
/// cookie : A Cookie object representing the refresh token.
/// tokens : A Data object containing a MongoDB repository (MongoRepo) for refresh token data storage.
///
/// # Returns
/// An HttpResponse representing the result of the operation. If the refresh token is valid, it returns
/// an HTTP 200 OK response with the JWT token. If the refresh token is invalid or expired, it returns
/// an HTTP 400 Bad Request response with an error message. If there's an error during the authentication
/// process, it returns an HTTP 500 Internal Server Error response with an error message.
async fn check_cookie(cookie: &Cookie<'_>, tokens: &Data<MongoRepo<RefreshToken>>) -> HttpResponse{
    let doc = doc! {"refresh_token" : cookie.value()};

    //checks to see if the token is in the database and gets the first response that is
    // brought back
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

    //check expiration date to see if the token is still valid
    let exp = result.exp;
    if exp <= Utc::now().timestamp() as usize {
        return HttpResponse::BadRequest().body("Refresh token has expired. Please re-\
            authenticate")
    }

    //if the token is still valid, generate a new token and refresh token and update the
    // database with the new token
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

    //Generate the response to the frontend
    return success_login_response(refresh_token, result.jwt_token.clone());
}

/// This function checks the username and password to see if it is valid. If it is, it generates a new token
/// and refresh token and updates the database with the new token.
///
/// # Parameters
/// user : A string representing the username and password of the user.
/// cache : A Data object containing a MongoDB repository (MongoRepo) for user data storage.
/// tokens : A Data object containing a MongoDB repository (MongoRepo) for refresh token data storage.
/// secret : A Data object containing a string representing the secret key for the JWT token.
///
/// # Returns
/// An HttpResponse representing the result of the operation. If the username and password are valid, it returns
/// an HTTP 200 OK response with the JWT token. If the username and password are invalid, it returns
/// an HTTP 400 Bad Request response with an error message. If there's an error during the authentication
/// process, it returns an HTTP 500 Internal Server Error response with an error message.
async fn check_username_password(user: String, cache: &Data<MongoRepo<User>>,
                                 tokens: &Data<MongoRepo<RefreshToken>>,
                                 secret: Data<String>) -> HttpResponse{
    //uses the username and password to authenticate the user
    //parses the username and password from the body of the request
    let json: LoginRequest = match serde_json::from_str(&user){
        Ok(user_auth) => user_auth,
        Err(_) => return HttpResponse::BadRequest().body("Please re-Authenticate with username \
        and password")
    };

    //checks to see if the username is in the database
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

    //checks to see if the password provided is correct. Hashes the password and compares it to
    // the hashed password in the database
    let parsed_hash = PasswordHash::new(&returned_user.hashed_password).unwrap();
    let result = Argon2::default().verify_password(json.password.as_bytes(), &parsed_hash);
    if result.is_err(){
        return HttpResponse::BadRequest().body("Invalid Email or Password");
    }

    //if the password is correct, generate a new token and refresh token and update the database
    // with the new token
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
    let new_id = match tokens.create_document(RefreshToken{
        id: None,
        user: returned_user.username.clone(),
        jwt_token: jwt_token.clone(),
        exp,
        refresh_token: refresh_token.clone(),
    }).await{
        Ok(id) => {id}
        Err(_) => {
            println!("Could not add the refresh token to the database, check if mongodb is \
            running");
            return HttpResponse::InternalServerError().body("Servers are currently down please \
                try again later")
        }
    };

    //Generate the response to the frontend
    success_login_response(refresh_token, jwt_token, returned_user.username.clone(), new_id
        .inserted_id.to_string())
}

/// This function generates a successful login response to the frontend.
///
/// # Parameters
/// refresh_token : A string representing the refresh token.
/// jwt_token : A string representing the JWT token.
///
/// # Returns
/// An HttpResponse representing the result of the operation.
fn success_login_response(refresh_token: String, jwt_token: String, username: String, user_id:
String) ->
                                                                                     HttpResponse{
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
        .insert_header(("Access-Control-Allow-Credentials", "true"))
        .insert_header(("Access-Control-Allow-Headers", "set-cookie"))
        .json(AuthResponse{ jwt_token, username, user_id})
}

async fn send_jwt(jwt: String) -> Result<Response, String> {
    let url = std::env::var("TOKEN_URL").unwrap();
    let client = reqwest::Client::builder()
        .danger_accept_invalid_certs(true)
        .build()
        .unwrap();
    let res = client.post(&url);
    let res = res.json(&jwt);
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

/// This function generates a random string of 32 characters.
///
/// # Returns
/// A string representing the random string.
fn generate_rand_string() -> String {
    rand::thread_rng()
        .sample_iter(&Alphanumeric)
        .take(32)
        .map(char::from)
        .collect()
}

