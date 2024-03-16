use crate::{model::estimate_model::JobEstimate, repository::mongodb_repo::MongoRepo};
use actix_web::{post, web::{Path}, HttpResponse, get, put, delete};
use mongodb::bson::oid::ObjectId;
use std::string::String;
use actix_web::web::Query;
use mongodb::bson::{doc, Document};
use crate::api::api_helper::{delete_data, get_all_data, get_data, post_data, push_update};
use crate::utils::token_extractor::AuthenticationToken;

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
pub async fn create_estimate(auth_token: AuthenticationToken, new_user: String,)
    -> HttpResponse {
    let db: MongoRepo<JobEstimate> = MongoRepo::init(COLLECTION, auth_token.userid.as_str()).await;
    let json: JobEstimate = match serde_json::from_str(&new_user){
        Ok(parsed_json) => parsed_json,
        Err(err) => {
            println!("Incorrect JSON object format from HTTPRequest. {}", err.to_string());
            return HttpResponse::InternalServerError()
                .body("Incorrect JSON object format from HTTPRequest Post request.")
        },
    };
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
pub async fn get_estimate(auth_token: AuthenticationToken, query:
Query<Document>, ) -> HttpResponse {
    let db: MongoRepo<JobEstimate> = MongoRepo::init(COLLECTION, auth_token.userid.as_str()).await;
    return match get_data(&db, query.into_inner()).await {
        Ok(user) => HttpResponse::Ok().json(user),
        Err(err) => HttpResponse::InternalServerError().body(err.to_string()),
    }
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
#[put("/estimate/{id}")]
pub async fn update_estimate(
    auth_token: AuthenticationToken,
    path: Path<String>,
    new_user: String, ) -> HttpResponse {
    let db: MongoRepo<JobEstimate> = MongoRepo::init(COLLECTION, auth_token.userid.as_str()).await;
    let id = path.into_inner();
    if id.is_empty() {
        return HttpResponse::BadRequest().body("invalid ID");
    };
    let mut data: JobEstimate = serde_json::from_str(&new_user).expect("Issue parsing object");
    data.id =  Some(ObjectId::parse_str(&id).unwrap());
    let doc = doc! {"_id": ObjectId::parse_str(&id).unwrap()};
    let update_result = db.update_document(doc, data).await;
    push_update(update_result, &db, id).await
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
pub async fn delete_estimate(auth_token: AuthenticationToken, query: Query<Document>) -> HttpResponse {
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
pub async fn get_all_estimates(auth_token: AuthenticationToken, _auth_token: AuthenticationToken)
    -> HttpResponse {
    let db: MongoRepo<JobEstimate> = MongoRepo::init(COLLECTION, auth_token.userid.as_str()).await;
    get_all_data(&db).await
}