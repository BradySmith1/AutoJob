use actix_web::{HttpResponse, post};
use crate::model::login_model::LoginRequest;
use actix_web::web::{Data};
use crate::repository::mongodb_repo::MongoRepo;
use password_hash::Salt;
use crate::model::user_model::User;

#[post("/user/enroll")]
pub async fn enroll_user(db: Data<MongoRepo<User>>, new_user: String) -> HttpResponse{
    let json: LoginRequest = match serde_json::from_str(&new_user){
        Ok(parsed_json) => parsed_json,
        Err(_) => {
            println!("Incorrect JSON object format from HTTPRequest.");
            return HttpResponse::InternalServerError()
                .body("Incorrect JSON object format from HTTPRequest Post request.")
        }
    };
    let salt = match Salt::from_b64(&json.password){
        Ok(salted) => salted.to_string(),
        Err(_) => return HttpResponse::InternalServerError().body("Password could not be salted.")
    };
    let new_user: User = User{
        id: None,
        username: json.username,
        salt,
        date_created: chrono::Utc::now().to_string()
    };
    let returned_user = db.create_document(new_user).await;
    match returned_user {
        Ok(user) => return HttpResponse::Ok().json(user),
        Err(_) => HttpResponse::InternalServerError()
            .body("Could not add document to the jobEstimate collection. Check if MongoDB \
                is running")
    }
}