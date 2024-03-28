use crate::api::api_helper::{delete_data, get_all_data, get_data, post_data, push_update};
use crate::model::estimate_model::JobEstimate;
use crate::model::schema_model::Schema;
use crate::repository::mongodb_repo::MongoRepo;
use crate::utils::token_extractor::AuthenticationToken;
use actix_web::web::{Path, Query};
use actix_web::{delete, get, post, put, HttpResponse};
use mongodb::bson::{doc, Document};

const COLLECTION: &str = "schemas";

#[put("/schema/{estimate_type}")]
pub async fn update_schema(
    auth_token: AuthenticationToken,
    path: Path<String>,
    new_schema: String,
) -> HttpResponse {
    let db: MongoRepo<Schema> = MongoRepo::init(COLLECTION, auth_token.userid.as_str()).await;
    let estimate_type = path.into_inner();
    if estimate_type.is_empty() {
        return HttpResponse::BadRequest().body("invalid ID");
    };
    let data = match serde_json::from_str(&new_schema) {
        Ok(parsed_json) => parsed_json,
        Err(_) => {
            println!("Incorrect JSON object format from HTTPRequest.");
            return HttpResponse::InternalServerError()
                .body("Incorrect JSON object format from HTTPRequest Post request.");
        }
    };
    let doc = doc! {"estimateType": estimate_type.clone()};
    let update_result = db.update_document(doc, data).await;
    push_update(update_result, &db, estimate_type).await
}

#[post("/schema")]
pub async fn create_schema(auth_token: AuthenticationToken, new_schema: String) -> HttpResponse {
    let db: MongoRepo<Schema> = MongoRepo::init(COLLECTION, auth_token.userid.as_str()).await;
    let json: Schema = match serde_json::from_str(&new_schema) {
        Ok(parsed_json) => parsed_json,
        Err(_) => {
            println!("Incorrect JSON object format from HTTPRequest.");
            return HttpResponse::InternalServerError()
                .body("Incorrect JSON object format from HTTPRequest Post request.");
        }
    };
    post_data(&db, json).await
}

#[get("/schema")]
pub async fn get_schema(auth_token: AuthenticationToken, query: Query<Document>) -> HttpResponse {
    let db: MongoRepo<Schema> = MongoRepo::init(COLLECTION, auth_token.userid.as_str()).await;
    return match get_data(&db, query.into_inner()).await {
        Ok(user) => HttpResponse::Ok().json(user),
        Err(err) => HttpResponse::InternalServerError().body(err.to_string()),
    };
}
#[get("/schemas")]
pub async fn get_all_schema(auth_token: AuthenticationToken) -> HttpResponse {
    let db: MongoRepo<Schema> = MongoRepo::init(COLLECTION, auth_token.userid.as_str()).await;
    get_all_data(&db).await
}

#[delete("/schema")]
pub async fn delete_schema(
    auth_token: AuthenticationToken,
    query: Query<Document>,
) -> HttpResponse {
    let db: MongoRepo<Schema> = MongoRepo::init(COLLECTION, auth_token.userid.as_str()).await;
    delete_data(&db, query.into_inner()).await
}
