use crate::{repository::mongodb_repo::MongoRepo};
use actix_web::{post, web::{Data, Path}, HttpResponse, get, put, delete};
use mongodb::bson::oid::ObjectId;
use std::string::String;
use mongodb::bson::extjson::de::Error;
use mongodb::results::UpdateResult;
use crate::api::api_helper::{delete_data, get_all_data, get_data, post_data, push_update};
use crate::model::library_model::MaterialFee;

/// Creates a new library entry via a POST request to the api web server
///
/// # Parameters
///
/// db : A Data object containing a MongoDB repository (MongoRepoEstimate) for materialLibrary
/// data storage.
/// new_user: A JSON object representing the job estimate to be created.
///
/// # Returns
///
/// An HttpResponse representing the result of the operation. If the materialLibrary entry is created
/// successfully, it returns an HTTP 200 OK response with the JSON representation of the created
/// materialLibrary entry. If there's
/// an error during the creation process, it returns an HTTP 500 Internal Server Error response with
/// an error message.
#[post("/library")]
pub async fn create_library_entry(db: Data<MongoRepo<MaterialFee>>, new_user: String) ->
                                                                                    HttpResponse {
    post_data(&db, &new_user).await
}

/// Retrieve materialLibrary entry details by their ID via a GET request.
///
/// # Parameters
///
/// db : A Data object containing a MongoDB repository (MongoRepoEstimate) for materialLibrary
/// entry data storage.
/// path : A Path object containing the job ID as a string extracted from the request URL.
///
/// # Returns
///
/// An HttpResponse representing the result of the operation. If the v with the specified ID is
/// found,
/// it returns an HTTP 200 OK response with the JSON representation of the materialLibrary
/// entry's details. If the provided ID
/// is empty or there's an error during the retrieval process, it returns an HTTP 400 Bad Request
/// response with an error message or an HTTP 500 Internal Server Error response with an error
/// message.
#[get("/library/{id}")]
pub async fn get_library_entry(db: Data<MongoRepo<MaterialFee>>, path: Path<String>) ->
                                                                                    HttpResponse {
    get_data(db, path).await

}

/// Update materialLibrary entry details by their ID via a PUT request.
///
/// # Parameters
///
/// db : A Data object containing a MongoDB repository (MongoRepoEstimate) for materialLibrary
/// entry data storage.
/// path : A Path object containing the job ID as a string extracted from the request URL.
/// new_user : A JSON object representing the materialLibrary entry estimate to be updated.
///
/// # Returns
///
/// An HttpResponse representing the result of the operation. If the materialLibrary entry with the
/// specified ID is found, it returns an HTTP 200 OK response with the JSON representation of the
/// updated materialLibrary entry's details. If the provided ID is empty or there's an error
/// during the update process, it returns an HTTP 400 Bad Request response with
/// an error message or an HTTP 500 Internal Server Error response with an error message.
#[put("/library/{id}")]
pub async fn update_library_entry(
    db: Data<MongoRepo<MaterialFee>>,
    path: Path<String>,
    new_user: String,
) -> HttpResponse {
    let id = path.into_inner();
    if id.is_empty() {
        return HttpResponse::BadRequest().body("invalid ID");
    };
    let mut data: MaterialFee = serde_json::from_str(&new_user).expect("Issue parsing object");
    data.id =  Some(ObjectId::parse_str(&id).unwrap());
    let update_result: Result<UpdateResult, Error>= db.update_document(&id, data).await;
    push_update(update_result, db, id).await
}

/// Delete materialLibrary entry details by their ID via a DELETE request.
///
/// # Parameters
///
/// db : A Data object containing a MongoDB repository (MongoRepoEstimate) for materialLibrary
/// entry data storage.
/// path : A Path object containing the job ID as a string extracted from the request URL.
///
/// # Returns
///
/// An HttpResponse representing the result of the operation. If the materialLibrary entry with
/// the specified ID is found, it returns an HTTP 200 OK response with a success message. If the
/// provided ID is empty or there's an error during the deletion process, it returns an HTTP 400
/// Bad Request response with an error message or an HTTP 500 Internal Server Error response with
/// an error message.
#[delete("/library/{id}")]
pub async fn delete_library_entry(db: Data<MongoRepo<MaterialFee>>, path: Path<String>) ->
                                                                                    HttpResponse {
    delete_data(db, path).await
}

/// Retrieve all materialLibrary entry details via a GET request.
///
/// # Parameters
///
/// db : A Data object containing a MongoDB repository (MongoRepoEstimate) for materialLibrary
/// entry data storage.
///
/// # Returns
///
/// An HttpResponse representing the result of the operation. If the materialLibrary entry with the
/// specified ID is found, it returns an HTTP 200 OK response with the JSON representation of the
/// materialLibrary entry's details. If the provided ID is empty or there's an error during the
/// retrieval process, it returns an HTTP 400 Bad Request response with an error message or an
/// HTTP 500 Internal Server Error response with an error message.
#[get("/libraries")]
pub async fn get_all_library_entries(db: Data<MongoRepo<MaterialFee>>) -> HttpResponse {
    get_all_data(db).await
}

#[get("/libraries/{descriptor}")]
pub async fn get_all_library_description(db: Data<MongoRepo<MaterialFee>>,  path: Path<String>) ->
                                                                                    HttpResponse {
    let users = db.get_documents_by_attribute(&path.into_inner()).await;
    match users {
        Ok(users) => HttpResponse::Ok().json(users),
        Err(err) => HttpResponse::InternalServerError().body(err.to_string()),
    }
}