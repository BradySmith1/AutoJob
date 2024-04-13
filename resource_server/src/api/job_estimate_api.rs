use std::io::Write;
use std::process::Command;
use crate::api::api_helper::{delete_data, get_all_data, get_data, post_data, push_update};
use crate::utils::token_extractor::AuthenticationToken;
use crate::{model::estimate_model::JobEstimate, repository::mongodb_repo::MongoRepo};
use actix_web::web::Query;
use actix_web::{delete, get, post, put, web::Path, HttpResponse};
use mongodb::bson::oid::ObjectId;
use mongodb::bson::{doc, Document};
use std::string::String;
use mongodb::results::UpdateResult;
use crate::model::model_trait::Model;

const COLLECTION: &str = "jobEstimates";

/// Creates a new jobEstimate via a POST request to the api web server
///
/// # Parameters
/// db : A Data object containing a MongoDB repository (MongoRepoEstimate) for jobEstimate data storage.
/// new_user: A JSON object representing the job estimate to be created.
///
/// # Returns
/// An HttpResponse representing the result of the operation. If the jobEstimate is created successfully,
/// it returns an HTTP 200 OK response with the JSON representation of the created jobEstimate. If there's
/// an error during the creation process, it returns an HTTP 500 Internal Server Error response with
/// an error message.
#[post("/estimate")]
pub async fn create_estimate(auth_token: AuthenticationToken, new_user: String) -> HttpResponse {
    let db: MongoRepo<JobEstimate> = MongoRepo::init(COLLECTION, auth_token.userid.as_str()).await;
    let mut json: JobEstimate = match serde_json::from_str(&new_user) {
        Ok(parsed_json) => parsed_json,
        Err(err) => {
            println!(
                "Incorrect JSON object format from HTTPRequest. {}",
                err.to_string()
            );
            return HttpResponse::InternalServerError()
                .body("Incorrect JSON object format from HTTPRequest Post request.");
        }
    };
    if json.status.eq("complete") {
        //create a file reader
        let mut file = std::fs::OpenOptions::new()
            .write(true)
            .create(true)
            .append(true)
            .open("email.txt")
            .expect("Could not create email file");
        file.write_all(new_user.as_bytes())
            .expect("Could not write to email file");
        let output = Command::new("npm")
            .current_dir("../emailer")
            .arg("run")
            .arg("/home/brady/schoolProjects/capstone/resource_server/email.txt")
            .output()
            .expect("Could not send email");
        if output.status.success() {
            println!("Email sent successfully");
        } else {
            println!("Email failed to send");
        }
        std::fs::remove_file("email.txt").expect("Could not remove email file");
    }
    json.date = Some(chrono::Utc::now().to_rfc3339());
    post_data(&db, json).await
}

/// Retrieve jobEstimate details by their ID via a GET request.
///
/// # Parameters
/// db : A Data object containing a MongoDB repository (MongoRepoEstimate) for jobEstimate data storage.
/// path : A Path object containing the job ID as a string extracted from the request URL.
///
/// # Returns
/// An HttpResponse representing the result of the operation. If the jobEstimate with the specified ID is found,
/// it returns an HTTP 200 OK response with the JSON representation of the jobEstimate's details. If the provided ID
/// is empty or there's an error during the retrieval process, it returns an HTTP 400 Bad Request response with
/// an error message or an HTTP 500 Internal Server Error response with an error message.
#[get("/estimate")]
pub async fn get_estimate(auth_token: AuthenticationToken, query: Query<Document>) -> HttpResponse {
    let db: MongoRepo<JobEstimate> = MongoRepo::init(COLLECTION, auth_token.userid.as_str()).await;
    return match get_data(&db, query.into_inner()).await {
        Ok(user) => HttpResponse::Ok().json(user),
        Err(err) => HttpResponse::InternalServerError().body(err.to_string()),
    };
}

/// Update jobEstimate details by their ID via a PUT request.
///
/// # Parameters
/// db : A Data object containing a MongoDB repository (MongoRepoEstimate) for jobEstimate data storage.
/// path : A Path object containing the job ID as a string extracted from the request URL.
/// new_user : A JSON object representing the jobEstimate estimate to be updated.
///
/// # Returns
/// An HttpResponse representing the result of the operation. If the jobEstimate with the specified ID is found,
/// it returns an HTTP 200 OK response with the JSON representation of the updated jobEstimate's details. If the provided ID
/// is empty or there's an error during the update process, it returns an HTTP 400 Bad Request response with
/// an error message or an HTTP 500 Internal Server Error response with an error message.
#[put("/estimate")]
pub async fn update_estimate(
    auth_token: AuthenticationToken,
    mut query: Query<Document>,
    new_user: String,
) -> HttpResponse {
    let db: MongoRepo<JobEstimate> = MongoRepo::init(COLLECTION, auth_token.userid.as_str()).await;
    if query.is_empty() {
        return HttpResponse::BadRequest().body("invalid ID");
    };
    if query.contains_key("_id") {
        let id = query.get("_id").unwrap().to_string().replace("\"", "");
        let obj_id = mongodb::bson::oid::ObjectId::parse_str(&id).unwrap();
        query.remove("_id");
        query.insert("_id", obj_id);
    }
    let data: JobEstimate = serde_json::from_str(&new_user).expect("Issue parsing object");
    let update_result: UpdateResult = match db.update_document(query.into_inner(), data).await{
        Ok(update) => update,
        Err(err) => {
            return HttpResponse::InternalServerError().body(err.to_string());
        }
    };
    return if update_result.modified_count > 0 {
        HttpResponse::Ok().json("Material has been updated (ID is the same)")
    }else{
        HttpResponse::InternalServerError().body("Could not update material")
    }
}

/// Delete jobEstimate details by their ID via a DELETE request.
///
/// # Parameters
/// db : A Data object containing a MongoDB repository (MongoRepoEstimate) for jobEstimate data storage.
/// path : A Path object containing the job ID as a string extracted from the request URL.
///
/// # Returns
/// An HttpResponse representing the result of the operation. If the jobEstimate with the specified ID is found,
/// it returns an HTTP 200 OK response with a success message. If the provided ID
/// is empty or there's an error during the deletion process, it returns an HTTP 400 Bad Request response with
/// an error message or an HTTP 500 Internal Server Error response with an error message.
#[delete("/estimate")]
pub async fn delete_estimate(
    auth_token: AuthenticationToken,
    query: Query<Document>,
) -> HttpResponse {
    let db: MongoRepo<JobEstimate> = MongoRepo::init(COLLECTION, auth_token.userid.as_str()).await;
    delete_data(&db, query.into_inner()).await
}

/// Retrieve all jobEstimate details via a GET request.
///
/// # Parameters
/// db : A Data object containing a MongoDB repository (MongoRepoEstimate) for jobEstimate data storage.
///
/// # Returns
/// An HttpResponse representing the result of the operation. If the jobEstimate with the specified ID is found,
/// it returns an HTTP 200 OK response with the JSON representation of the jobEstimate's details. If the provided ID
/// is empty or there's an error during the retrieval process, it returns an HTTP 400 Bad Request response with
/// an error message or an HTTP 500 Internal Server Error response with an error message.
#[get("/estimates")]
pub async fn get_all_estimates(
    auth_token: AuthenticationToken,
    _auth_token: AuthenticationToken,
) -> HttpResponse {
    let db: MongoRepo<JobEstimate> = MongoRepo::init(COLLECTION, auth_token.userid.as_str()).await;
    get_all_data(&db).await
}
