use crate::{model::estimate_model::JobEstimate, repository::mongodb_estimate_repo::MongoRepoEstimate};
use actix_web::{post, web::{Data, Json, Path}, HttpResponse, get, put, delete};
use mongodb::bson::oid::ObjectId;

/// Creates a new jobEstimate via a POST request to the api web server
///
/// # Parameters
///
/// db : A Data object containing a MongoDB repository (MongoRepoEstimate) for jobEstimate data storage.
/// new_user: A JSON object representing the job estimate to be created.
///
/// # Returns
///
/// An HttpResponse representing the result of the operation. If the jobEstimate is created successfully,
/// it returns an HTTP 200 OK response with the JSON representation of the created jobEstimate. If there's
/// an error during the creation process, it returns an HTTP 500 Internal Server Error response with
/// an error message.
#[post("/estimate")]
pub async fn create_estimate(db: Data<MongoRepoEstimate>, new_user: Json<JobEstimate>) -> HttpResponse {
    let data = build_user(&new_user);
    let user_detail = db.create_estimate(data).await;
    match user_detail {
        Ok(user) => HttpResponse::Ok().json(user),
        Err(err) => HttpResponse::InternalServerError().body(err.to_string()),
    }
}

/// Retrieve jobEstimate details by their ID via a GET request.
///
/// # Parameters
///
/// db : A Data object containing a MongoDB repository (MongoRepoEstimate) for jobEstimate data storage.
/// path : A Path object containing the job ID as a string extracted from the request URL.
///
/// # Returns
///
/// An HttpResponse representing the result of the operation. If the jobEstimate with the specified ID is found,
/// it returns an HTTP 200 OK response with the JSON representation of the jobEstimate's details. If the provided ID
/// is empty or there's an error during the retrieval process, it returns an HTTP 400 Bad Request response with
/// an error message or an HTTP 500 Internal Server Error response with an error message.
#[get("/estimate/{id}")]
pub async fn get_estimate(db: Data<MongoRepoEstimate>, path: Path<String>) -> HttpResponse {
    let id = path.into_inner();
    if id.is_empty() {
        return HttpResponse::BadRequest().body("invalid ID");
    }
    let user_detail = db.get_estimate(&id).await;
    match user_detail {
        Ok(user) => HttpResponse::Ok().json(user),
        Err(err) => HttpResponse::InternalServerError().body(err.to_string()),
    }
}

/// Update jobEstimate details by their ID via a PUT request.
///
/// # Parameters
///
/// db : A Data object containing a MongoDB repository (MongoRepoEstimate) for jobEstimate data storage.
/// path : A Path object containing the job ID as a string extracted from the request URL.
/// new_user : A JSON object representing the jobEstimate estimate to be updated.
///
/// # Returns
///
/// An HttpResponse representing the result of the operation. If the jobEstimate with the specified ID is found,
/// it returns an HTTP 200 OK response with the JSON representation of the updated jobEstimate's details. If the provided ID
/// is empty or there's an error during the update process, it returns an HTTP 400 Bad Request response with
/// an error message or an HTTP 500 Internal Server Error response with an error message.
#[put("/estimate/{id}")]
pub async fn update_estimate(
    db: Data<MongoRepoEstimate>,
    path: Path<String>,
    new_user: Json<JobEstimate>,
) -> HttpResponse {
    let id = path.into_inner();
    if id.is_empty() {
        return HttpResponse::BadRequest().body("invalid ID");
    };
    let data = JobEstimate {
        id: Some(ObjectId::parse_str(&id).unwrap()),
        fName: new_user.fName.to_owned(),
        lName: new_user.lName.to_owned(),
        email: new_user.email.to_owned(),
        strAddr: new_user.strAddr.to_owned(),
        city: new_user.city.to_owned(),
        state: new_user.state.to_owned(),
        zip: new_user.zip.to_owned(),
        measurements: new_user.measurements.to_owned(),
        details: new_user.details.to_owned(),
        materials: new_user.materials.to_owned()
    };
    let update_result = db.update_estimate(&id, data).await;
    match update_result {
        Ok(update) => {
            if update.matched_count == 1 {
                let updated_user_info = db.get_estimate(&id).await;
                return match updated_user_info {
                    Ok(user) => HttpResponse::Ok().json(user),
                    Err(err) => HttpResponse::InternalServerError().body(err.to_string()),
                };
            } else {
                return HttpResponse::NotFound().body("No user found with specified ID");
            }
        }
        Err(err) => HttpResponse::InternalServerError().body(err.to_string()),
    }
}

/// Delete jobEstimate details by their ID via a DELETE request.
///
/// # Parameters
///
/// db : A Data object containing a MongoDB repository (MongoRepoEstimate) for jobEstimate data storage.
/// path : A Path object containing the job ID as a string extracted from the request URL.
///
/// # Returns
///
/// An HttpResponse representing the result of the operation. If the jobEstimate with the specified ID is found,
/// it returns an HTTP 200 OK response with a success message. If the provided ID
/// is empty or there's an error during the deletion process, it returns an HTTP 400 Bad Request response with
/// an error message or an HTTP 500 Internal Server Error response with an error message.
#[delete("/estimate/{id}")]
pub async fn delete_estimate(db: Data<MongoRepoEstimate>, path: Path<String>) -> HttpResponse {
    let id = path.into_inner();
    if id.is_empty() {
        return HttpResponse::BadRequest().body("invalid ID");
    };
    let result = db.delete_estimate(&id).await;
    match result {
        Ok(res) => {
            if res.deleted_count == 1 {
                return HttpResponse::Ok().json("User successfully deleted!");
            } else {
                return HttpResponse::NotFound().json("User with specified ID not found!");
            }
        }
        Err(err) => HttpResponse::InternalServerError().body(err.to_string()),
    }
}

/// Retrieve all jobEstimate details via a GET request.
///
/// # Parameters
///
/// db : A Data object containing a MongoDB repository (MongoRepoEstimate) for jobEstimate data storage.
///
/// # Returns
///
/// An HttpResponse representing the result of the operation. If the jobEstimate with the specified ID is found,
/// it returns an HTTP 200 OK response with the JSON representation of the jobEstimate's details. If the provided ID
/// is empty or there's an error during the retrieval process, it returns an HTTP 400 Bad Request response with
/// an error message or an HTTP 500 Internal Server Error response with an error message.
#[get("/estimates")]
pub async fn get_all_estimates(db: Data<MongoRepoEstimate>) -> HttpResponse {
    let users = db.get_all_estimates().await;
    match users {
        Ok(users) => HttpResponse::Ok().json(users),
        Err(err) => HttpResponse::InternalServerError().body(err.to_string()),
    }
}

/// Helper function to build a UserEstimate object from a JSON object.
///
/// # Parameters
///
/// new_user : A JSON object representing the user estimate to be created.
///
/// # Returns
///
/// A UserEstimate object representing the user estimate to be created.
fn build_user(new_user: &Json<JobEstimate>) -> JobEstimate {
    JobEstimate {
        id: None,
        fName: new_user.fName.to_owned(),
        lName: new_user.lName.to_owned(),
        email: new_user.email.to_owned(),
        strAddr: new_user.strAddr.to_owned(),
        city: new_user.city.to_owned(),
        state: new_user.state.to_owned(),
        zip: new_user.zip.to_owned(),
        measurements: new_user.measurements.to_owned(),
        details: new_user.details.to_owned(),
        materials: new_user.materials.to_owned()
    }
}