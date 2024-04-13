use actix_web::{HttpResponse, post};
use crate::model::login_model::LoginRequest;
use actix_web::web::{Data};
use crate::repository::mongodb_repo::MongoRepo;
use crate::model::user_model::User;
use argon2::{
    password_hash::{
        rand_core::OsRng,
        PasswordHasher, SaltString
    },
    Argon2
};
use mongodb::bson::doc;


/// This function enrolls a user via a POST request to the api web server
/// This function requires a http request holding the username and password of a new user.
///
/// # Parameters
/// db : A Data object containing a MongoDB repository (MongoRepo) for user data storage.
/// new_user : A string representing the username and password of the new user.
///
/// # Returns
/// An HttpResponse representing the result of the operation. If the user is enrolled successfully,
/// it returns an HTTP 200 OK response with the JSON representation of the enrolled user. If there's
/// an error during the enrollment process, it returns an HTTP 500 Internal Server Error response with
/// an error message.
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
    let salt = SaltString::generate(&mut OsRng);
    let argon2 = Argon2::default();
    let password_hash = argon2.hash_password(json.password.as_bytes(), &salt).unwrap().to_string();
    let doc = doc! {
        "username": json.username.clone()
    };
    let user = db.get_documents_by_attribute(doc).await;
    match user {
        Ok(vec) => {
            if vec.len() > 0 {
                return HttpResponse::Conflict()
                    .body("User already exists in the database.")
            }
            },
        Err(_) => ()
    }
    let new_user: User = User{
        id: None,
        username: json.username,
        hashed_password: password_hash,
        date_created: chrono::Utc::now().to_string()
    };
    let returned_user = db.create_document(new_user).await;
    match returned_user {
        Ok(user) => return HttpResponse::Ok().json(user),
        Err(_) => HttpResponse::InternalServerError()
            .body("Could not add document to the user collection. Check if MongoDB \
                is running")
    }
}