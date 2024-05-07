use crate::api::api_helper::{delete_data, get_all_data, get_data, post_data, };
use crate::model::schema_model::{Schema};
use crate::repository::mongodb_repo::MongoRepo;
use crate::utils::token_extractor::AuthenticationToken;
use actix_web::web::{Query};
use actix_web::{delete, get, post, put, HttpResponse};
use mongodb::bson::{doc, Document};
use mongodb::results::UpdateResult;
use crate::model::billable_model::Billable;

const COLLECTION: &str = "schemas"; // Collection name for a schema

/// This function updates the schema in the database.
///
/// # Parameters
///
/// * `auth_token` - An AuthenticationToken object containing the user's authentication token.
/// * `query` - A Query object containing the query to be used to update the schema.
/// * `new_schema` - A String object containing the new schema to be updated.
///
/// # Returns
///
/// An HttpResponse object containing the result of the operation.
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
    //parse the id to a mongodb object id
    if query.contains_key("_id") {
        let id = query.get("_id").unwrap().to_string().replace("\"", "");
        let obj_id = mongodb::bson::oid::ObjectId::parse_str(&id).unwrap();
        query.remove("_id");
        query.insert("_id", obj_id);
    }
    //parse the new schema to a Schema object
    let new_data: Schema = serde_json::from_str(&new_schema).expect("Issue parsing object");
    let old_data: Schema = match get_data(&db, query.clone().into_inner()).await{
        Ok(data) => data[0].clone(),
        Err(_) => {
            return HttpResponse::InternalServerError().body("Could not retrieve data from collection. Check if MongoDB is running")
        }
    };
    // check if the stages are the same between the old and new schemas.
    let (delete_ids, delete_fields) = validate_library(old_data.clone(), new_data.clone());
    let material_db: MongoRepo<Billable> = MongoRepo::init("materialFeeLibrary", auth_token.userid
        .as_str())
        .await;
    // if the stages are different between the old and new schemas, then you need to delete the
    // stages that are not in the new schema.
    material_db.delete_document(doc!{"stageID": {"$in": delete_ids}}).await.expect("Failed to \
    delete material's from library by stage IDs");
    material_db.get_collection().update_many(doc!{}, doc!{"$unset": {"inputs": {"$in":
        delete_fields}}}, None).await.expect("Failed to delete fields from material library");
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

/// This function validates the library based on the old and new data.
/// It returns a tuple containing the deleted stages and the deleted fields.
///
/// # Parameters
///
/// * `old_data` - A Schema object representing the old data.
/// * `new_data` - A Schema object representing the new data.
///
/// # Returns
///
/// A tuple containing the deleted stages and the deleted fields.
fn validate_library(old_data: Schema, new_data: Schema) -> (Vec<String>, Vec<String>) {
    let mut deleted_stages = vec![];
    let mut kept_stages = vec![];
    // check if the stages are the same between the old and new data.
    old_data.form.iter().for_each(|old_stage| {
        let mut contains = false;
        new_data.form.iter().for_each(|new_stage| {
            if new_stage.stageID.eq(&old_stage.stageID) {
                contains = true;
            }
        });
        if !contains {
            deleted_stages.push(old_stage.stageID.clone());
        }else{
            kept_stages.push(old_stage.clone());
        }
    });
    let mut delete_fields = vec![];
    // Within the stages that are the same, check if the fields are the same.
    kept_stages.iter().for_each(|stage| {
        new_data.form.iter().for_each(|new_stage|{
            if new_stage.stageID.eq(&stage.stageID){
                stage.fields.iter().for_each(|field|{
                    let mut contains = false;
                    new_stage.fields.iter().for_each(|new_field|{
                        if new_field.name.eq(&field.name){
                            contains = true;
                        }
                    });
                    if !contains{
                        delete_fields.push(field.name.clone());
                    }
                });
            }
        });
    });

    (deleted_stages, delete_fields)
}

/// This function creates a new schema in the database.
///
/// # Parameters
///
/// * `auth_token` - An AuthenticationToken object containing the user's authentication token.
/// * `new_schema` - A String object containing the new schema to be created.
///
/// # Returns
///
/// An HttpResponse object containing the result of the operation.
#[post("/schema")]
pub async fn create_schema(auth_token: AuthenticationToken, new_schema: String) -> HttpResponse {
    let db: MongoRepo<Schema> = MongoRepo::init(COLLECTION, auth_token.userid.as_str()).await;
    //parse the new schema to a Schema object
    let json: Schema = match serde_json::from_str(&new_schema) {
        Ok(parsed_json) => parsed_json,
        Err(_) => {
            println!("Incorrect JSON object format from HTTPRequest.");
            return HttpResponse::InternalServerError()
                .body("Incorrect JSON object format from HTTPRequest Post request.");
        }
    };
    // posts the data to the database
    post_data(&db, json).await
}

/// This function retrieves a schema from the database.
///
/// # Parameters
///
/// * `auth_token` - An AuthenticationToken object containing the user's authentication token.
/// * `query` - A Query object containing the query to be used to retrieve the schema.
///
/// # Returns
///
/// An HttpResponse object containing the result of the operation.
#[get("/schema")]
pub async fn get_schema(auth_token: AuthenticationToken, query: Query<Document>) -> HttpResponse {
    let db: MongoRepo<Schema> = MongoRepo::init(COLLECTION, auth_token.userid.as_str()).await;
    // gets the schema
    return match get_data(&db, query.into_inner()).await {
        Ok(user) => HttpResponse::Ok().json(user),
        Err(err) => HttpResponse::InternalServerError().body(err.to_string()),
    };
}


/// This function retrieves all schemas from the database.
///
/// # Parameters
///
/// * `auth_token` - An AuthenticationToken object containing the user's authentication token.
///
/// # Returns
///
/// An HttpResponse object containing the result of the operation.
#[get("/schemas")]
pub async fn get_all_schema(auth_token: AuthenticationToken) -> HttpResponse {
    let db: MongoRepo<Schema> = MongoRepo::init(COLLECTION, auth_token.userid.as_str()).await;
    get_all_data(&db).await
}


/// This function deletes a schema from the database.
///
/// # Parameters
///
/// * `auth_token` - An AuthenticationToken object containing the user's authentication token.
/// * `query` - A Query object containing the query to be used to delete the schema.
///
/// # Returns
///
/// An HttpResponse object containing the result of the operation.
#[delete("/schema")]
pub async fn delete_schema(
    auth_token: AuthenticationToken,
    query: Query<Document>,
) -> HttpResponse {
    let db: MongoRepo<Schema> = MongoRepo::init(COLLECTION, auth_token.userid.as_str()).await;
    // gets the schema to delete
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
    // deletes the schema in the material library as well as the schema library
    let query_lib = doc! {"presetID": data.presetID.clone()};
    let db_library: MongoRepo<Billable> = MongoRepo::init("materialFeeLibrary", auth_token.userid
        .as_str()).await;
    delete_data(&db_library, query_lib).await;
    delete_data(&db, query.into_inner()).await
}
