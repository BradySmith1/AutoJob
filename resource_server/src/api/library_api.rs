use crate::api::api_helper::{delete_data, get_all_data, get_data, post_data, push_update};
use crate::model::billable_model::Billable;
use crate::repository::mongodb_repo::MongoRepo;
use crate::utils::token_extractor::AuthenticationToken;
use actix_web::web::Query;
use actix_web::{delete, get, post, put, web::Path, HttpResponse};
use mongodb::bson::oid::ObjectId;
use mongodb::bson::{doc, Document};
use mongodb::results::UpdateResult;
use mongodb::Client;
use std::string::String;
use serde_json::Value;

const COLLECTION: &str = "materialFeeLibrary";

/// Creates a new library entry via a POST request to the api web server
///
/// # Parameters
/// db : A Data object containing a MongoDB repository (MongoRepoEstimate) for materialLibrary
/// data storage.
/// new_user: A JSON object representing the job estimate to be created.
///
/// # Returns
/// An HttpResponse representing the result of the operation. If the materialLibrary entry is created
/// successfully, it returns an HTTP 200 OK response with the JSON representation of the created
/// materialLibrary entry. If there's
/// an error during the creation process, it returns an HTTP 500 Internal Server Error response with
/// an error message.
#[post("/library")]
pub async fn create_library_entry(
    new_user: String,
    auth_token: AuthenticationToken,
) -> HttpResponse {
    let db: MongoRepo<Billable> = MongoRepo::init(COLLECTION, auth_token.userid.as_str()).await;
    let mut json: Billable = match serde_json::from_str(&new_user) {
        Ok(parsed_json) => parsed_json,
        Err(_) => {
            println!("Incorrect JSON object format from HTTPRequest.");
            return HttpResponse::InternalServerError()
                .body("Incorrect JSON object format from HTTPRequest Post request.");
        }
    };
    let response = check_auto_update(&mut json);
    if !response.status().is_success() {
        return response;
    }
    post_data(&db, json).await
}

#[post("/library/inputs")]
pub async fn create_inputs(query: Query<Document>, auth_token: AuthenticationToken, inputs: String)
    -> HttpResponse {
    let db: MongoRepo<Billable> = MongoRepo::init(COLLECTION, auth_token.userid.as_str()).await;
    let data = query.into_inner();
    let stage_id = data.get("stageID").unwrap().as_str().unwrap();
    let preset_id = data.get("presetID").unwrap().as_str().unwrap();
    let inputs: Vec<String> = match serde_json::from_str(&inputs){
        Ok(vec) => vec,
        Err(_) => {
            return HttpResponse::BadRequest().body("Not a array of strings in the body.")
        }
    };
    let doc = doc! {"stageID": stage_id, "presetID": preset_id};
    let result = db.get_documents_by_attribute(doc).await;
    let mut billables = match result {
        Ok(billable) => billable,
        Err(_) => {
            return HttpResponse::InternalServerError().body("Could not retrieve billable");
        }
    };
    for mut billable in billables {
        let mut input_map = billable.inputs.unwrap();
        for key in inputs.iter() {
            input_map.insert(key.clone(), Value::from(""));
        }
        billable.inputs = Some(input_map);
        let doc = doc! {"_id": ObjectId::parse_str(billable.id.unwrap().to_string()).unwrap()};
        let update_result = db.update_document(doc, billable).await;
        if update_result.is_err(){
            return HttpResponse::InternalServerError().body("Could not add inputs");
        }
    }
    HttpResponse::Ok().body("Successfully added inputs")
}

fn check_auto_update(json: &mut Billable) -> HttpResponse {
    if json.autoUpdate.eq("true") && json.autoUpdate.clone().eq("true") {
        if json.company.is_none() {
            return HttpResponse::BadRequest().body(
                "auto_update field is true but no company was \
            provided",
            );
        }
        let company = json.clone().company.unwrap();
        if !company.eq("lowes") && !company.eq("homedepot") {
            return HttpResponse::BadRequest().body("Invalid company name");
        }
        json.ttl = Some((chrono::Utc::now() + chrono::Duration::days(7)).to_string());
    }
    return HttpResponse::Ok().finish();
}

/// Retrieve materialLibrary entry details by their ID via a GET request.
///
/// # Parameters
/// db : A Data object containing a MongoDB repository (MongoRepoEstimate) for materialLibrary
/// entry data storage.
/// path : A Path object containing the job ID as a string extracted from the request URL.
///
/// # Returns
/// An HttpResponse representing the result of the operation. If the v with the specified ID is
/// found,
/// it returns an HTTP 200 OK response with the JSON representation of the materialLibrary
/// entry's details. If the provided ID
/// is empty or there's an error during the retrieval process, it returns an HTTP 400 Bad Request
/// response with an error message or an HTTP 500 Internal Server Error response with an error
/// message.
#[get("/library")]
pub async fn get_library_entry(
    query: Query<Document>,
    auth_token: AuthenticationToken,
) -> HttpResponse {
    let db: MongoRepo<Billable> = MongoRepo::init(COLLECTION, auth_token.userid.as_str()).await;
    return match get_data(&db, query.into_inner()).await {
        Ok(data) => HttpResponse::Ok().json(data),
        Err(err) => HttpResponse::InternalServerError().body(err.to_string()),
    };
}

/// Update materialLibrary entry details by their ID via a PUT request.
///
/// # Parameters
/// db : A Data object containing a MongoDB repository (MongoRepoEstimate) for materialLibrary
/// entry data storage.
/// path : A Path object containing the job ID as a string extracted from the request URL.
/// new_user : A JSON object representing the materialLibrary entry estimate to be updated.
///
/// # Returns
/// An HttpResponse representing the result of the operation. If the materialLibrary entry with the
/// specified ID is found, it returns an HTTP 200 OK response with the JSON representation of the
/// updated materialLibrary entry's details. If the provided ID is empty or there's an error
/// during the update process, it returns an HTTP 400 Bad Request response with
/// an error message or an HTTP 500 Internal Server Error response with an error message.
#[put("/library/{id}")]
pub async fn update_library_entry(
    path: Path<String>,
    new_user: String,
    auth_token: AuthenticationToken,
) -> HttpResponse {
    let db: MongoRepo<Billable> = MongoRepo::init(COLLECTION, auth_token.userid.as_str()).await;
    let id = path.into_inner();
    if id.is_empty() {
        return HttpResponse::BadRequest().body("invalid ID");
    };
    let mut data: Billable = serde_json::from_str(&new_user).expect("Issue parsing object");
    data.id = Some(ObjectId::parse_str(&id).unwrap());
    let response = check_auto_update(&mut data);
    if !response.status().is_success() {
        return response;
    }
    let doc = doc! {"_id": id.to_string()};
    let update_result: Result<UpdateResult, String> = db.update_document(doc, data).await;
    push_update(update_result, &db, id).await
}

/// Delete materialLibrary entry details by their ID via a DELETE request.
///
/// # Parameters
/// db : A Data object containing a MongoDB repository (MongoRepoEstimate) for materialLibrary
/// entry data storage.
/// path : A Path object containing the job ID as a string extracted from the request URL.
///
/// # Returns
/// An HttpResponse representing the result of the operation. If the materialLibrary entry with
/// the specified ID is found, it returns an HTTP 200 OK response with a success message. If the
/// provided ID is empty or there's an error during the deletion process, it returns an HTTP 400
/// Bad Request response with an error message or an HTTP 500 Internal Server Error response with
/// an error message.
#[delete("/library")]
pub async fn delete_library_entry(
    query: Query<Document>,
    auth_token: AuthenticationToken,
) -> HttpResponse {
    let db: MongoRepo<Billable> = MongoRepo::init(COLLECTION, auth_token.userid.as_str()).await;
    delete_data(&db, query.into_inner()).await
}

#[delete("/library/inputs")]
pub async fn delete_inputs(query: Query<Document>, auth_token: AuthenticationToken, inputs: String)
    ->
                                                                                     HttpResponse{
    let db: MongoRepo<Billable> = MongoRepo::init(COLLECTION, auth_token.userid.as_str()).await;
    let data = query.into_inner();
    let stage_id = data.get("stageID").unwrap().as_str().unwrap();
    let preset_id = data.get("presetID").unwrap().as_str().unwrap();
    let inputs: Vec<String> = match serde_json::from_str(&inputs){
        Ok(vec) => vec,
        Err(_) => {
            return HttpResponse::BadRequest().body("Not a array of strings in the body.")
        }
    };
    let doc = doc! {"stageID": stage_id, "presetID": preset_id};
    let result = db.get_documents_by_attribute(doc).await;
    let mut billables = match result {
        Ok(billable) => billable,
        Err(_) => {
            return HttpResponse::InternalServerError().body("Could not retrieve billable");
        }
    };
    for mut billable in billables {
        let mut input_map = billable.inputs.unwrap();
        for key in inputs.iter() {
            input_map.remove(key);
        }
        billable.inputs = Some(input_map);
        let doc = doc! {"_id": ObjectId::parse_str(billable.id.unwrap().to_string()).unwrap()};
        let update_result = db.update_document(doc, billable).await;
        if update_result.is_err(){
            return HttpResponse::InternalServerError().body("Could not delete inputs")
        }
    }
    HttpResponse::Ok().body("Successfully deleted inputs")
}

/// Retrieve all materialLibrary entry details via a GET request.
///
/// # Parameters
/// db : A Data object containing a MongoDB repository (MongoRepoEstimate) for materialLibrary
/// entry data storage.
///
/// # Returns
/// An HttpResponse representing the result of the operation. If the materialLibrary entry with the
/// specified ID is found, it returns an HTTP 200 OK response with the JSON representation of the
/// materialLibrary entry's details. If the provided ID is empty or there's an error during the
/// retrieval process, it returns an HTTP 400 Bad Request response with an error message or an
/// HTTP 500 Internal Server Error response with an error message.
#[get("/libraries")]
pub async fn get_all_library_entries(auth_token: AuthenticationToken) -> HttpResponse {
    let db: MongoRepo<Billable> = MongoRepo::init(COLLECTION, auth_token.userid.as_str()).await;
    get_all_data(&db).await
}

/// This is the function that runs on a timer in the main function that checks the current
/// MaterialLibrary for if there are products needing to be auto updated.
///
/// # Parameters
/// db : A Data object containing a MongoDB repository (MongoRepoEstimate) for materialLibrary
/// entry data storage.
pub async fn check_libraries() {
    let client = Client::with_uri_str(std::env::var("MONGOURL").unwrap())
        .await
        .unwrap();
    let db_list = client.list_database_names(doc! {}, None).await.unwrap();
    for dbs in db_list {
        let db: MongoRepo<Billable> = MongoRepo::init(COLLECTION, dbs.as_str()).await;
        println!(
            "{}: Starting Web Scraping Task",
            chrono::Utc::now().to_string()
        );
        let materials = match db.get_all_documents().await {
            Ok(materials) => materials,
            Err(_) => {
                println!("Could not retrieve materials from database");
                return;
            }
        };
        if materials.is_empty() {
            println!("No materials in database");
            return;
        }
        for material in materials {
            //ttl is still implemented. however i dont know if i need it or not. I might just deal with
            //the time to live in the web scraper api
            if material.autoUpdate.eq("true") && material.autoUpdate.clone().eq("true") {
                let mut new_material = material.clone();
                let scraper_data = match crate::api::scraper_api::get_scraper_data(
                    material.name.clone(),
                    material.company.clone().unwrap(),
                )
                .await
                {
                    Ok(data) => data,
                    Err(err) => {
                        if err.eq("no products found") {
                            println!(
                                "No products found for material: {}, {}",
                                material.name,
                                material.company.clone().unwrap()
                            );
                        } else if err.eq("error getting web cache") {
                            println!("Error getting web cache. Check if web cache is running");
                        } else {
                            println!("Internal Server error.");
                        }
                        return;
                    }
                };
                new_material.price = scraper_data.price;
                new_material.ttl =
                    Some((chrono::Utc::now() + chrono::Duration::days(7)).to_string());
                let doc =
                    doc! {"_id": ObjectId::parse_str(material.id.unwrap().to_string()).unwrap()};
                let update_result: Result<UpdateResult, String> =
                    db.update_document(doc, new_material).await;
                match update_result {
                    Ok(_) => println!(
                        "Updated material: {}, {}",
                        material.name,
                        material.company.clone().unwrap()
                    ),
                    Err(_) => println!(
                        "Could not update material: {}, {}",
                        material.name,
                        material.company.clone().unwrap()
                    ),
                }
            }
        }
        println!(
            "{}: Finished Web Scraping Task",
            chrono::Utc::now().to_string()
        );
    }
}
