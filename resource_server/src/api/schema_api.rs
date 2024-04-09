use crate::api::api_helper::{delete_data, get_all_data, get_data, post_data, push_update};
use crate::model::estimate_model::JobEstimate;
use crate::model::schema_model::Schema;
use crate::repository::mongodb_repo::MongoRepo;
use crate::utils::token_extractor::AuthenticationToken;
use actix_web::web::{get, Path, Query};
use actix_web::{delete, get, post, put, HttpResponse};
use mongodb::bson::{doc, Document};
use mongodb::results::UpdateResult;
use crate::model::billable_model::Billable;

const COLLECTION: &str = "schemas";

#[put("/schema")]
pub async fn update_schema(
    auth_token: AuthenticationToken,
    mut query: Query<Document>,
    new_schema: String,
) -> HttpResponse {
    let db: MongoRepo<Schema> = MongoRepo::init(COLLECTION, auth_token.userid.as_str()).await;
    if query.is_empty() {
        return HttpResponse::BadRequest().body("invalid ID");
    };
    if query.contains_key("_id") {
        let id = query.get("_id").unwrap().to_string().replace("\"", "");
        let obj_id = mongodb::bson::oid::ObjectId::parse_str(&id).unwrap();
        query.remove("_id");
        query.insert("_id", obj_id);
    }
    let new_data: Schema = serde_json::from_str(&new_schema).expect("Issue parsing object");
    let old_data: Schema = match get_data(&db, query.clone().into_inner()).await{
        Ok(data) => data[0].clone(),
        Err(_) => {
            return HttpResponse::InternalServerError().body("Could not retrieve data from collection. Check if MongoDB is running")
        }
    };
    let delete_ids = validate_library(old_data.clone(), new_data.clone());
    let material_db: MongoRepo<Billable> = MongoRepo::init("materialFeeLibrary", auth_token.userid
        .as_str())
        .await;
    material_db.delete_document(doc!{"stageID": {"$in": delete_ids}}).await.expect("Failed to \
    delete material's from library by stage IDs");
    // if the stages are the same between the old and new schemas, then you need to check the
    // inputs of the stages and delete the ones that are not in the new schema.
    let update_result: UpdateResult = match db.update_document(query.into_inner(), new_data).await{
        Ok(update) => update,
        Err(err) => {
            return HttpResponse::InternalServerError().body(err.to_string());
        }
    };
    return if update_result.modified_count > 0 {
        HttpResponse::Ok().json("Material has been updated (ID is the same)")
    }else{
        HttpResponse::InternalServerError().body("Could not update material")
    }
}

fn validate_library(old_data: Schema, new_data: Schema) -> Vec<String> {
    let mut deleted_stages = vec![];
    old_data.form.iter().for_each(|old_stage| {
        let mut contains = false;
        new_data.form.iter().for_each(|new_stage| {
            if new_stage.stageID.eq(&old_stage.stageID) {
                contains = true;
            }
        });
        if !contains {
            deleted_stages.push(old_stage.stageID.clone());
        }
    });
    deleted_stages
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
    let data = match get_data(&db, query.clone().into_inner()).await{
        Ok(data) => data,
        Err(_) => {
            return HttpResponse::InternalServerError().body("Could not retrieve data from collection. Check if MongoDB is running")
        }
    };
    let data = match data.get(0){
        Some(data) => data,
        None => {
            return HttpResponse::BadRequest().body("Data not found")
        }
    };
    let query_lib = doc! {"presetID": data.presetID.clone()};
    let db_library: MongoRepo<Billable> = MongoRepo::init("materialFeeLibrary", auth_token.userid
        .as_str()).await;
    delete_data(&db_library, query_lib).await;
    delete_data(&db, query.into_inner()).await
}
