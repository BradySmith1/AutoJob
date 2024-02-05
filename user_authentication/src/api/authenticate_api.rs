use actix_web::{HttpResponse, post};
use crate::model::login_model::LoginRequest;
use actix_web::web::{Data, Query};
use mongodb::bson::doc;
use crate::model::user_model::User;
use password_hash::Salt;
use crate::repository::mongodb_repo::MongoRepo;

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
    let returned_user = returned_user.get(0);
    let salt = match Salt::from_b64(&json.password){
        Ok(salted) => salted.to_string(),
        Err(_) => return HttpResponse::InternalServerError().body("Password could not be salted.")
    };
    //from here i need to do the authentication thingy
    return HttpResponse::Ok().finish();
}