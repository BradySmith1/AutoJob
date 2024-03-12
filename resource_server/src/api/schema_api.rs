use actix_web::{get, HttpResponse, put};
use actix_web::web::Query;
use mongodb::bson::Document;
use crate::api::api_helper::{get_data, post_data};
use crate::model::schema_model::Schema;
use crate::repository::mongodb_repo::MongoRepo;
use crate::utils::token_extractor::AuthenticationToken;

const COLLECTION: &str = "schemas";
#[put("/schema")]
pub async fn edit_schema(auth_token: AuthenticationToken, new_user: String,)
                             -> HttpResponse {
    let db: MongoRepo<Schema> = MongoRepo::init(COLLECTION, auth_token.userid.as_str()).await;
    let json: Schema = match serde_json::from_str(&new_user){
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
