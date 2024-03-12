use actix_web::{get, HttpResponse, put};
use actix_web::web::{Path, Query};
use mongodb::bson::Document;
use mongodb::bson::oid::ObjectId;
use crate::api::api_helper::{get_data, push_update};
use crate::model::schema_model::Schema;
use crate::repository::mongodb_repo::MongoRepo;
use crate::utils::token_extractor::AuthenticationToken;

const COLLECTION: &str = "schemas";

#[put("/schema/{id}")]
pub async fn update_schema(
    auth_token: AuthenticationToken,
    path: Path<String>,
    new_schema: String, ) -> HttpResponse {
    let db: MongoRepo<Schema> = MongoRepo::init(COLLECTION, auth_token.userid.as_str()).await;
    let id = path.into_inner();
    if id.is_empty() {
        return HttpResponse::BadRequest().body("invalid ID");
    };
    let mut data: Schema = serde_json::from_str(&new_schema).expect("Issue parsing object");
    data.id =  Some(ObjectId::parse_str(&id).unwrap());
    let update_result = db.update_document(&id, data).await;
    push_update(update_result, &db, id).await
}

#[get("/schema")]
pub async fn get_schema(auth_token: AuthenticationToken, query:
Query<Document>, ) -> HttpResponse {
    let db: MongoRepo<Schema> = MongoRepo::init(COLLECTION, auth_token.userid.as_str()).await;
    return match get_data(&db, query.into_inner()).await {
        Ok(user) => HttpResponse::Ok().json(user),
        Err(err) => HttpResponse::InternalServerError().body(err.to_string()),
    }
}
