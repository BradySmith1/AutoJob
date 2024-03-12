use actix_web::{get, HttpResponse, post, put};
use actix_web::web::{Path, Query};
use mongodb::bson::{doc, Document};
use crate::api::api_helper::{get_data, post_data, push_update};
use crate::model::schema_model::Schema;
use crate::repository::mongodb_repo::MongoRepo;
use crate::utils::token_extractor::AuthenticationToken;

const COLLECTION: &str = "schemas";

#[put("/schema/{estimateType}")]
pub async fn update_schema(
    auth_token: AuthenticationToken,
    path: Path<String>,
    new_schema: String, ) -> HttpResponse {
    let db: MongoRepo<Schema> = MongoRepo::init(COLLECTION, auth_token.userid.as_str()).await;
    let estimate_type = path.into_inner();
    if estimate_type.is_empty() {
        return HttpResponse::BadRequest().body("invalid ID");
    };
    let data: Schema = serde_json::from_str(&new_schema).expect("Issue parsing object");
    let doc = doc! {"estimateType": estimate_type.clone()};
    let update_result = db.update_document(doc, data).await;
    push_update(update_result, &db, estimate_type).await
}

#[post("/schema")]
pub async fn create_schema(auth_token: AuthenticationToken, new_schema: String,) -> HttpResponse {
    let db: MongoRepo<Schema> = MongoRepo::init(COLLECTION, auth_token.userid.as_str()).await;
    let json: Schema = match serde_json::from_str(&new_schema){
        Ok(parsed_json) => parsed_json,
        Err(_) => {
            println!("Incorrect JSON object format from HTTPRequest.");
            return HttpResponse::InternalServerError()
                .body("Incorrect JSON object format from HTTPRequest Post request.")
        },
    };
    post_data(&db, json).await
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
