use crate::model::model_trait::Model;
use crate::repository::mongodb_repo::MongoRepo;
use actix_web::HttpResponse;
use mongodb::bson::{doc, Document};

/// A helper function used to create a new document in the database.
///
/// # Parameters
/// db: A Data object containing the MongoRepo object.
/// new_json: A JSON object containing the data to be added to the database.
///
/// # Returns
/// An HttpResponse representing the result of the operation. If the document is created,
/// it returns an HTTP 200 OK response with the JSON representation of the created document.
/// If the document is not created, it returns an HTTP 500 Internal Server Error response
pub async fn post_data<T: Model<T>>(db: &MongoRepo<T>, new_json: T) -> HttpResponse {
    let user_detail = db.create_document(new_json).await;
    match user_detail {
        Ok(user) => HttpResponse::Ok().json(user),
        Err(_) => HttpResponse::InternalServerError().body(
            "Could not add document to the jobEstimate collection. Check if MongoDB \
                is running",
        ),
    }
}

/// A helper function used to get a document in the database.
///
/// # Parameters
/// db: A Data object containing the MongoRepo object.
/// query: A MongoDB Document object containing the query to be used to retrieve the data.
///
/// # Returns
/// A Result object containing the retrieved data. or an error if the data could not be retrieved.
pub async fn get_data<T: Model<T>>(
    db: &MongoRepo<T>,
    mut query: Document,
) -> Result<Vec<T>, String> {
    let user_detail: Result<Vec<T>, String>;
    if query.is_empty() {
        user_detail = db.get_all_documents().await;
    } else {
        if query.contains_key("_id") {
            let id = query.get("_id").unwrap().to_string().replace("\"", "");
            let obj_id = mongodb::bson::oid::ObjectId::parse_str(&id).unwrap();
            query.remove("_id");
            query.insert("_id", obj_id);
        }
        user_detail = db.get_documents_by_attribute(query).await;
    }
    user_detail
}

/// A helper function used to delete a document in the database.
///
/// # Parameters
/// db: A Data object containing the MongoRepo object.
/// query: A MongoDB Document object containing the query to be used to delete the data.
///
/// # Returns
/// returns an HTTP 200 OK response with the JSON representation of the deleted document.
/// If the document is not deleted, it returns an HTTP 500 Internal Server Error response
pub async fn delete_data<T: Model<T>>(db: &MongoRepo<T>, mut query: Document) -> HttpResponse {
    if query.is_empty() {
        return HttpResponse::BadRequest().body("invalid attribute");
    }
    if query.contains_key("_id") {
        let id = query.get("_id").unwrap().to_string().replace("\"", "");
        let obj_id = mongodb::bson::oid::ObjectId::parse_str(&id).unwrap();
        query.remove("_id");
        query.insert("_id", obj_id);
    }
    let result = db.delete_document(query).await;
    match result {
        Ok(res) => {
            if res.deleted_count == 1 {
                return HttpResponse::Ok().json("User successfully deleted!");
            } else {
                return HttpResponse::NotFound().json("User with specified attributes not found!");
            }
        }
        Err(err) => HttpResponse::InternalServerError().body(err.to_string()),
    }
}

/// A helper function used to get all documents in the database.
///
/// # Parameters
/// db: A Data object containing the MongoRepo object.
///
/// # Returns
/// An HttpResponse representing the result of the operation. If the document is created,
/// it returns an HTTP 200 OK response with the JSON representation of the created document.
/// If the document is not created, it returns an HTTP 500 Internal Server Error response.
pub async fn get_all_data<T: Model<T>>(db: &MongoRepo<T>) -> HttpResponse {
    let users = db.get_all_documents().await;
    match users {
        Ok(users) => HttpResponse::Ok().json(users),
        Err(err) => HttpResponse::InternalServerError().body(err.to_string()),
    }
}

/// A helper function used to update a document in the database.
///
/// # Parameters
/// result: A Result object containing the result of the update operation.
/// db: A Data object containing the MongoRepo object.
/// id: The id of a object in the form of a string.
///
/// # Returns
/// An HttpResponse representing the result of the operation. If the document is updated,
/// it returns an HTTP 200 OK response with the JSON representation of the created document.
/// If the document is not created, it returns an HTTP 500 Internal Server Error response.
/// If the id is not a valid ID, it returns a HTTP Not Found Error Response.
pub async fn push_update<T: Model<T>>(
    db: &MongoRepo<T>,
    id: String,
) -> HttpResponse {
            let document = doc! {"_id": id};
            let updated_user_info = db.get_documents_by_attribute(document).await;
            return match updated_user_info {
                Ok(user) => HttpResponse::Ok().json(user),
                Err(err) => HttpResponse::InternalServerError().body(err.to_string()),
            };
}
