use actix_web::HttpResponse;
use actix_web::web::{Data};
use mongodb::bson::{doc, Document};
use mongodb::bson::extjson::de::Error;
use mongodb::results::UpdateResult;
use crate::model::model_trait::Model;
use crate::repository::mongodb_repo::MongoRepo;

pub async fn post_data<T: Model<T>>(db: &Data<MongoRepo<T>>, new_json: T) -> HttpResponse {
    let user_detail = db.create_document(new_json).await;
    match user_detail {
        Ok(user) => HttpResponse::Ok().json(user),
        Err(_) => HttpResponse::InternalServerError()
            .body("Could not add document to the jobEstimate collection. Check if MongoDB \
                is running"),
    }
}

pub async fn get_data<T: Model<T>>(db: &Data<MongoRepo<T>>, mut query: Document) ->
                                                                                 Result<Vec<T>, Error> {
    let user_detail:Result<Vec<T>, Error>;
    if query.is_empty() {
        user_detail = db.get_all_documents().await;
    }else{
        if query.contains_key("_id"){
            let id = query.get("_id").unwrap().to_string().replace("\"", "");
            let obj_id = mongodb::bson::oid::ObjectId::parse_str(&id).unwrap();
            query.remove("_id");
            query.insert("_id", obj_id);
        }
        user_detail = db.get_documents_by_attribute(query).await;
    }
    user_detail
}

pub async fn delete_data<T: Model<T>>(db: Data<MongoRepo<T>>,mut query: Document) -> HttpResponse {
    if query.is_empty() {
        return HttpResponse::BadRequest().body("invalid attribute");
    }
    if query.contains_key("_id"){
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
&Data<MongoRepo<T>>, id: String) -> HttpResponse{
    match result {
        Ok(update) => {
            if update.matched_count == 1 {
                let document = doc! {"_id": id};
                let updated_user_info = db.get_documents_by_attribute(document).await;
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