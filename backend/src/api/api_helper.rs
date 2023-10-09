use actix_web::HttpResponse;
use actix_web::web::{Data, Path};
use mongodb::bson::extjson::de::Error;
use mongodb::results::UpdateResult;
use crate::model::model_trait::Model;
use crate::repository::mongodb_repo::MongoRepo;

pub async fn get_data<T: Model<T>>(db: Data<MongoRepo<T>>, path: Path<String>) -> HttpResponse {
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

pub async fn delete_data<T: Model<T>>(db: Data<MongoRepo<T>>, path: Path<String>) -> HttpResponse {
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

pub async fn get_all_data<T: Model<T>>(db: Data<MongoRepo<T>>) -> HttpResponse {
    let users = db.get_all_estimates().await;
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