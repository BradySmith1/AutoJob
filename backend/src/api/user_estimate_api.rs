use crate::{model::user_model::UserEstimate, repository::mongodb_repo::MongoRepo};
use actix_web::{post, web::{Data, Json, Path}, HttpResponse, get, Responder, put, delete};
use mongodb::bson::oid::ObjectId;
use crate::api::api_helper::{delete_data, get_all_data, get_data, post_data, push_update};

/// Creates a new userEstimate via a POST request to the api web server
///
/// # Parameters
///
///  db : A Data object containing a MongoDB repository (MongoRepoUser) for userEstimate data storage.
/// new_user: A JSON object representing the user estimate to be created.
///
/// # Returns
///
/// An HttpResponse representing the result of the operation. If the userEstimate is created successfully,
/// it returns an HTTP 200 OK response with the JSON representation of the created userEstimate. If there's
/// an error during the creation process, it returns an HTTP 500 Internal Server Error response with
/// an error message.
#[post("/user")]
pub async fn create_user(db: Data<MongoRepo<UserEstimate>>, new_user: String) ->
                                                                                    HttpResponse {
    post_data(db, new_user).await
}

/// Retrieve userEstimate details by their ID via a GET request.
///
/// # Parameters
///
/// db : A Data object containing a MongoDB repository (MongoRepoUser) for userEstimate data storage.
/// path : A Path object containing the user ID as a string extracted from the request URL.
///
/// # Returns
///
/// An HttpResponse representing the result of the operation. If the userEstimate with the specified ID is found,
/// it returns an HTTP 200 OK response with the JSON representation of the userEstimate's details. If the provided ID
/// is empty or there's an error during the retrieval process, it returns an HTTP 400 Bad Request response with
/// an error message or an HTTP 500 Internal Server Error response with an error message.
#[get("/user/{id}")]
pub async fn get_user(db: Data<MongoRepo<UserEstimate>>, path: Path<String>) -> HttpResponse {
    get_data(db, path).await
}

/// Update userEstimate details by their ID via a PUT request.
///
/// # Parameters
///
/// db : A Data object containing a MongoDB repository (MongoRepoUser) for userEstimate data storage.
/// path : A Path object containing the user ID as a string extracted from the request URL.
/// new_user : A JSON object representing the userEstimate estimate to be updated.
///
/// # Returns
///
/// An HttpResponse representing the result of the operation. If the userEstimate with the specified ID is found,
/// it returns an HTTP 200 OK response with the JSON representation of the updated userEstimate's details. If the provided ID
/// is empty or there's an error during the update process, it returns an HTTP 400 Bad Request response with
/// an error message or an HTTP 500 Internal Server Error response with an error message.
#[put("/user/{id}")]
pub async fn update_user(
    db: Data<MongoRepo<UserEstimate>>,
    path: Path<String>,
    new_user: Json<UserEstimate>,
) -> HttpResponse {
    let id = path.into_inner();
    if id.is_empty() {
        return HttpResponse::BadRequest().body("invalid ID");
    };
    let data = UserEstimate {
        id: Some(ObjectId::parse_str(&id).unwrap()),
        fName: new_user.fName.to_owned(),
        lName: new_user.lName.to_owned(),
        email: new_user.email.to_owned(),
        strAddr: new_user.strAddr.to_owned(),
        city: new_user.city.to_owned(),
        state: new_user.state.to_owned(),
        zip: new_user.zip.to_owned(),
        measurements: new_user.measurements.to_owned(),
        details: new_user.details.to_owned()
    };
    let update_result = db.update_estimate(&id, data).await;
    push_update(update_result, db, id).await
}

/// Delete userEstimate details by their ID via a DELETE request.
///
/// # Parameters
///
/// db : A Data object containing a MongoDB repository (MongoRepoUser) for userEstimate data storage.
/// path : A Path object containing the user ID as a string extracted from the request URL.
///
/// # Returns
///
/// An HttpResponse representing the result of the operation. If the userEstimate with the specified ID is found,
/// it returns an HTTP 200 OK response with the JSON representation of the deleted userEstimate's details. If the provided ID
/// is empty or there's an error during the deletion process, it returns an HTTP 400 Bad Request response with
/// an error message or an HTTP 500 Internal Server Error response with an error message.
#[delete("/user/{id}")]
pub async fn delete_user(db: Data<MongoRepo<UserEstimate>>, path: Path<String>) -> HttpResponse {
    delete_data(db, path).await
}

/// Retrieve all userEstimate details via a GET request.
///
/// # Parameters
///
/// db : A Data object containing a MongoDB repository (MongoRepoUser) for userEstimate data storage.
///
/// # Returns
///
/// An HttpResponse representing the result of the operation. If the userEstimate details are retrieved successfully,
/// it returns an HTTP 200 OK response with the JSON representation of the userEstimate's details. If there's an error
/// during the retrieval process, it returns an HTTP 500 Internal Server Error response with an error message.
#[get("/users")]
pub async fn get_all_users(db: Data<MongoRepo<UserEstimate>>) -> HttpResponse {
    get_all_data(db).await
}

/// connects you to the index page when connecting to the api web server.
#[get("/")]
async fn index() -> impl Responder {
    "Hello world!"
}