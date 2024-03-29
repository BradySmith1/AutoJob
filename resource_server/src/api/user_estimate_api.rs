use crate::api::api_helper::{delete_data, get_all_data, get_data, post_data, push_update};
use crate::model::image_model::Image;
use crate::utils::token_extractor::AuthenticationToken;
use crate::{
    model::user_model::UserEstimateUploadForm, model::user_model::UserEstimate,
    repository::mongodb_repo::MongoRepo,
};
use actix_files::NamedFile;
use actix_multipart::form::MultipartForm;
use actix_web::body::MessageBody;
use actix_web::web::Query;
use actix_web::{
    delete, get, post, put,
    web::{Json, Path},
    Error, HttpRequest, HttpResponse, Responder,
};
use mongodb::bson::oid::ObjectId;
use mongodb::bson::{doc, Document};
use mongodb::results::UpdateResult;
use serde_json::{json, Value};
use crate::model::estimate_model::JobEstimate;

const COLLECTION: &str = "userEstimates";

/// Creates a new userEstimate via a POST request to the api web server
///
/// # Parameters
///
///  db : A Data object containing a MongoDB repository (MongoRepoUser) for userEstimate data storage.
/// new_user: A JSON object representing the user estimate to be created.
///
/// # Returns
///
/// An HttpResponse representing the result of the operation. If the userEstimate is created successfully,
/// it returns an HTTP 200 OK response with the JSON representation of the created userEstimate. If there's
/// an error during the creation process, it returns an HTTP 500 Internal Server Error response with
/// an error message.
#[post("/user")]
pub async fn create_user(
    MultipartForm(form): MultipartForm<UserEstimateUploadForm>,
) -> HttpResponse {
    //initializes the MongoDB repository
    let db: MongoRepo<UserEstimate> = MongoRepo::init(COLLECTION, form.company_id.as_str()).await;

    //checks if there is a user entry in the JSON object
    let user: &String = &form.user.to_string();
    if user.is_empty() {
        return HttpResponse::BadRequest().body("invalid format for userEstimate");
    }

    //parses the JSON object from the HTTP request
    let json: UserEstimate = match serde_json::from_str(&user) {
        Ok(parsed_json) => parsed_json,
        Err(_) => {
            println!("Incorrect JSON object format from HTTPRequest.");
            return HttpResponse::InternalServerError()
                .body("Incorrect JSON object format from HTTPRequest Post request.");
        }
    };

    //creates a new userEstimate in the userEstimate collection
    let json = post_data(&db, json)
        .await
        .into_body()
        .try_into_bytes()
        .unwrap();
    let mut id = std::str::from_utf8(&json).unwrap();
    id = id.rsplit("\"").collect::<Vec<&str>>()[1];

    //saves the images to the computer
    let references = match save_files(form, id).await {
        Ok(refers) => refers,
        Err(_) => {
            println!("Error: Could not save files from FormData");
            return HttpResponse::InternalServerError().body("Could not save files");
        }
    };
    if references.is_empty() {
        let mut hash = Document::new();
        hash.insert("_id".to_string(), id);
        return match get_data(&db, hash).await {
            //get data takes a id as a string and parses it
            Ok(user) => HttpResponse::Ok().json(user), //inside the function
            Err(err) => HttpResponse::InternalServerError().body(err.to_string()),
        };
    }

    let mut user_value: Value = serde_json::from_str(user).unwrap();
    user_value["images"] = Value::from(references);
    let json_user = serde_json::from_value(user_value).unwrap();
    let doc = doc! {"_id": id.to_string()};
    let response = match db.update_document(doc, json_user).await{
        Ok(update) => update,
        Err(err) => {
            return HttpResponse::InternalServerError().body(err.to_string());
        }
    };
    return if response.matched_count < 1 {
        push_update(&db, id.to_string()).await
    }else {
        HttpResponse::InternalServerError().body("Could not update material")
    }
    //might want to just return a id
}

/// A helper function to save files to a certain part of the computer.
///
/// # Parameters
/// form: A struct UploadForm that is used to temporarily store the images before persisting them.
/// id: The id the user has, this is used to create the name of a folder.
///
/// # Returns
/// Returns a result of a vec of image references and where to find them in the computer.
async fn save_files(form: UserEstimateUploadForm, id: &str) -> Result<Vec<Value>, Error> {
    let mut image_vec: Vec<Value> = vec![];
    if form.files.len() == 0 {
        return Ok(image_vec);
    }
    let image_path = std::env::var("IMAGE_PATH").unwrap();
    for f in form.files {
        let path = format!("{}{}", image_path, id);
        std::fs::create_dir_all(&path).expect("Could not create directories");
        let path = format!("{}{}/{}", image_path, id, f.file_name.clone().unwrap());
        f.file.persist(&path).unwrap();
        let path = format!("{}/{}", id, f.file_name.unwrap());
        image_vec.push(json!({"reference": &path}));
    }

    Ok(image_vec)
}

/// Retrieve userEstimate details by their ID via a GET request.
///
/// # Parameters
/// db : A Data object containing a MongoDB repository (MongoRepoUser) for userEstimate data storage.
/// path : A Path object containing the user ID as a string extracted from the request URL.
///
/// # Returns
/// An HttpResponse representing the result of the operation. If the userEstimate with the specified ID is found,
/// it returns an HTTP 200 OK response with the JSON representation of the userEstimate's details. If the provided ID
/// is empty or there's an error during the retrieval process, it returns an HTTP 400 Bad Request response with
/// an error message or an HTTP 500 Internal Server Error response with an error message.
#[get("/user")]
pub async fn get_user(query: Query<Document>, auth_token: AuthenticationToken) -> HttpResponse {
    let db: MongoRepo<UserEstimate> = MongoRepo::init(COLLECTION, auth_token.userid.as_str()).await;
    return match get_data(&db, query.into_inner()).await {
        Ok(user) => HttpResponse::Ok().json(user),
        Err(err) => HttpResponse::InternalServerError().body(err.to_string()),
    };
}

/// A helper function to get a image through a file path
///
/// # Parameters
/// req: The whole HttpRequest, this is used to find the image path through one of its querys
///
/// # Returns
/// Returns a HttpRequest with either a OK 200 response with the images or a 500 Bad Request
/// response if the image cannot be found.
#[get("/userimage")]
pub async fn get_image(req: HttpRequest, _auth_token: AuthenticationToken) -> HttpResponse {
    let name_query = &req.query_string().to_string();
    let name =
        std::env::var("IMAGE_PATH").unwrap() + name_query.split("=").collect::<Vec<&str>>()[1];
    let name_change = format!("reference={}", name);
    let query = Query::<Image>::from_query(&*name_change).unwrap();
    let path = std::path::PathBuf::from(&query.reference);
    let file = NamedFile::open_async(path).await.unwrap();

    file.into_response(&req)
}

/// Update userEstimate details by their ID via a PUT request.
///
/// # Parameters
///
/// db : A Data object containing a MongoDB repository (MongoRepoUser) for userEstimate data storage.
/// path : A Path object containing the user ID as a string extracted from the request URL.
/// new_user : A JSON object representing the userEstimate estimate to be updated.
///
/// # Returns
///
/// An HttpResponse representing the result of the operation. If the userEstimate with the specified ID is found,
/// it returns an HTTP 200 OK response with the JSON representation of the updated userEstimate's details. If the provided ID
/// is empty or there's an error during the update process, it returns an HTTP 400 Bad Request response with
/// an error message or an HTTP 500 Internal Server Error response with an error message.
#[put("/user")]
pub async fn update_user(
    query: Query<Document>,
    new_user: String,
    auth_token: AuthenticationToken,
) -> HttpResponse {
    let db: MongoRepo<UserEstimate> = MongoRepo::init(COLLECTION, auth_token.userid.as_str())
        .await;
    if query.is_empty() {
        return HttpResponse::BadRequest().body("invalid ID");
    };
    let data: UserEstimate = serde_json::from_str(&new_user).expect("Issue parsing object");
    let update_result: UpdateResult = match db.update_document(query.into_inner(), data).await{
        Ok(update) => update,
        Err(err) => {
            return HttpResponse::InternalServerError().body(err.to_string());
        }
    };
    return if update_result.matched_count < 1 {
        push_update(&db, update_result.upserted_id.unwrap().to_string()).await
    }else{
        HttpResponse::InternalServerError().body("Could not update material")
    }
}

/// Delete userEstimate details by their ID via a DELETE request.
///
/// # Parameters
///
/// db : A Data object containing a MongoDB repository (MongoRepoUser) for userEstimate data storage.
/// path : A Path object containing the user ID as a string extracted from the request URL.
///
/// # Returns
///
/// An HttpResponse representing the result of the operation. If the userEstimate with the specified ID is found,
/// it returns an HTTP 200 OK response with the JSON representation of the deleted userEstimate's details. If the provided ID
/// is empty or there's an error during the deletion process, it returns an HTTP 400 Bad Request response with
/// an error message or an HTTP 500 Internal Server Error response with an error message.
#[delete("/user")]
pub async fn delete_user(query: Query<Document>, auth_token: AuthenticationToken) -> HttpResponse {
    let db: MongoRepo<UserEstimate> = MongoRepo::init(COLLECTION, auth_token.userid.as_str()).await;
    delete_data(&db, query.into_inner()).await
}

/// Retrieve all userEstimate details via a GET request.
///
/// # Parameters
///
/// db : A Data object containing a MongoDB repository (MongoRepoUser) for userEstimate data storage.
///
/// # Returns
///
/// An HttpResponse representing the result of the operation. If the userEstimate details are retrieved successfully,
/// it returns an HTTP 200 OK response with the JSON representation of the userEstimate's details. If there's an error
/// during the retrieval process, it returns an HTTP 500 Internal Server Error response with an error message.
#[get("/users")]
pub async fn get_all_users(auth_token: AuthenticationToken) -> HttpResponse {
    let db: MongoRepo<UserEstimate> = MongoRepo::init(COLLECTION, auth_token.userid.as_str()).await;
    get_all_data(&db).await
}

/// connects you to the index page when connecting to the api web server.
#[get("/")]
async fn index() -> impl Responder {
    "Hello world!"
}
