use std::collections::HashMap;
use actix_web::HttpResponse;
use actix_web::web::{Data};
use mongodb::bson::doc;
use mongodb::bson::extjson::de::Error;
use mongodb::results::UpdateResult;
use crate::model::model_trait::Model;
use crate::repository::mongodb_repo::MongoRepo;

pub async fn post_data<T: Model<T>>(db: &Data<MongoRepo<T>>, new_user: &String) -> HttpResponse {
    let data = serde_json::from_str(&new_user);
    let json: T = match data{
        Ok(parsed_json) => parsed_json,
        Err(_) => {
            println!("Incorrect JSON object format from HTTPRequest.");
            return HttpResponse::InternalServerError()
                .body("Incorrect JSON object format from HTTPRequest Post request.")
        },
    };
    let user_detail = db.create_document(json).await;
    match user_detail {
        Ok(user) => HttpResponse::Ok().json(user),
        Err(_) => HttpResponse::InternalServerError()
            .body("Could not add document to the jobEstimate collection. Check if MongoDB \
                is running"),
    }
}

pub async fn get_data<T: Model<T>>(db: Data<MongoRepo<T>>, query: HashMap<String,
    String>) -> HttpResponse{
    if query.is_empty() {
        return HttpResponse::BadRequest().body("invalid attribute");
    }
    if query.contains_key("id") {
        let id = query.get("id").unwrap();
        let user_detail = db.get_document_by_id(id).await;
        return match user_detail {
            Ok(user) => HttpResponse::Ok().json(user),
            Err(err) => HttpResponse::InternalServerError().body(err.to_string()),
        };
    }
    let mut doc = doc! {};
    for (key, value) in query.iter() {
        doc.insert(key, value);
    }
    println!("{:?}", doc);
    let user_detail = db.get_documents_by_attribute(doc).await;
    match user_detail {
        Ok(user) => HttpResponse::Ok().json(user),
        Err(err) => HttpResponse::InternalServerError().body(err.to_string()),
    }
}

pub async fn delete_data<T: Model<T>>(db: Data<MongoRepo<T>>, query: HashMap<String,
    String>) ->
                                                                                    HttpResponse {
    if query.is_empty() {
        return HttpResponse::BadRequest().body("invalid attribute");
    }
    if query.contains_key("id") {
        let id = query.get("id").unwrap();
        let user_detail = db.get_document_by_id(id).await;
        return match user_detail {
            Ok(user) => HttpResponse::Ok().json(user),
            Err(err) => HttpResponse::InternalServerError().body(err.to_string()),
        };
    }
    let mut doc = doc! {};
    for (key, value) in query.iter() {
        doc.insert(key, value);
    }
    let result = db.delete_document(doc).await;
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

pub async fn get_all_data<T: Model<T>>(db: Data<MongoRepo<T>>) -> HttpResponse {
    let users = db.get_all_documents().await;
    match users {
        Ok(users) => HttpResponse::Ok().json(users),
        Err(err) => HttpResponse::InternalServerError().body(err.to_string()),
    }
}

pub async fn push_update<T: Model<T>>(result: Result<UpdateResult, Error>, db:
Data<MongoRepo<T>>, id: String) -> HttpResponse{
    match result {
        Ok(update) => {
            if update.matched_count == 1 {
                let updated_user_info = db.get_document_by_id(&id).await;
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