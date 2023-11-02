use crate::{model::user_model::UserEstimate, repository::mongodb_repo::MongoRepo,
            model::form_data_model::UploadForm};
use actix_web::{post, web::{Data, Json, Path}, HttpResponse, Error, get, Responder, put, delete, HttpRequest};
use actix_multipart::{
    form::{
        MultipartForm,
    },
};
use actix_files::NamedFile;
use actix_web::body::MessageBody;
use actix_web::web::Query;
use mongodb::bson::oid::ObjectId;
use serde_json::{json, Value};
use crate::api::api_helper::{delete_data, get_all_data, get_data, post_data, push_update};
use crate::model::image_model::Image;

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
pub async fn create_user(db: Data<MongoRepo<UserEstimate>>, MultipartForm(form): MultipartForm<UploadForm>) ->
                                                                                                            HttpResponse {
    let user: &String = &form.user.to_string();
    if user.is_empty() {
        return HttpResponse::BadRequest().body("invalid format for userEstimate");
    }
    let json = post_data(&db, user).await.into_body().try_into_bytes().unwrap();
    let mut id = std::str::from_utf8(&json).unwrap();
    id = id.rsplit("\"").collect::<Vec<&str>>()[1];

    let references = match save_files(form, id).await{
        Ok(refers) => {refers},
        Err(_) => {
            println!("Error: Could not save files from FormData");
            return HttpResponse::InternalServerError().body("Could not save files");
        },
    };
    if references.is_empty(){
        return get_data(db, Path::from(id.to_string())).await;
    }

    let mut user_value: Value = serde_json::from_str(user).unwrap();
    user_value["images"] = Value::from(references);
    let json_user = serde_json::from_value(user_value).unwrap();
    let response = db.update_document(&id.to_string(), json_user).await;
    push_update(response, db, id.to_string()).await
    //might want to just return a id
}

async fn save_files(form: UploadForm, id: &str) -> Result<Vec<Value>,
    Error> {
    let mut image_vec: Vec<Value> = vec![];
    if form.files[0].size == 0 {
        return Ok(image_vec);
    }
    let image_path = std::env::var("IMAGE_PATH").unwrap();
    for f in form.files {
        let path = format!("{}{}", image_path, id);
        std::fs::create_dir_all(&path).expect("Could not create directories");
        let path = format!("{}{}/{}",image_path, id, f.file_name.clone().unwrap());
        f.file.persist(&path).unwrap();
        let path = format!("{}/{}", id, f.file_name.unwrap());
        image_vec.push(json!({"reference": &path}));
    }

    Ok(image_vec)
}

/// Retrieve userEstimate details by their ID via a GET request.
///
/// # Parameters
///
/// db : A Data object containing a MongoDB repository (MongoRepoUser) for userEstimate data storage.
/// path : A Path object containing the user ID as a string extracted from the request URL.
///
/// # Returns
///
/// An HttpResponse representing the result of the operation. If the userEstimate with the specified ID is found,
/// it returns an HTTP 200 OK response with the JSON representation of the userEstimate's details. If the provided ID
/// is empty or there's an error during the retrieval process, it returns an HTTP 400 Bad Request response with
/// an error message or an HTTP 500 Internal Server Error response with an error message.
#[get("/user/{id}")]
pub async fn get_user(db: Data<MongoRepo<UserEstimate>>, path: Path<String>) -> HttpResponse {
    get_data(db, path).await
}

#[get("/userimage")]
pub async fn get_image(req: HttpRequest) -> HttpResponse {
    let name_query =  &req.query_string().to_string();
    let name = std::env::var("IMAGE_PATH").unwrap() +
        name_query.split("=").collect::<Vec<&str>>()[1];
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
#[put("/user/{id}")]
pub async fn update_user(
    db: Data<MongoRepo<UserEstimate>>,
    path: Path<String>,
    new_user: Json<UserEstimate>,
) -> HttpResponse {
    let id = path.into_inner();
    if id.is_empty() {
        return HttpResponse::BadRequest().body("invalid ID");
    };
    let data = UserEstimate {
        id: Some(ObjectId::parse_str(&id).unwrap()),
        fName: new_user.fName.to_owned(),
        lName: new_user.lName.to_owned(),
        email: new_user.email.to_owned(),
        strAddr: new_user.strAddr.to_owned(),
        city: new_user.city.to_owned(),
        state: new_user.state.to_owned(),
        zip: new_user.zip.to_owned(),
        measurements: new_user.measurements.to_owned(),
        details: new_user.details.to_owned(),
        images: new_user.images.to_owned(),
    };
    let update_result = db.update_document(&id, data).await;
    push_update(update_result, db, id).await
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
#[delete("/user/{id}")]
pub async fn delete_user(db: Data<MongoRepo<UserEstimate>>, path: Path<String>) -> HttpResponse {
    delete_data(db, path).await
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
pub async fn get_all_users(db: Data<MongoRepo<UserEstimate>>) -> HttpResponse {
    get_all_data(db).await
}

/// connects you to the index page when connecting to the api web server.
#[get("/")]
async fn index() -> impl Responder {
    "Hello world!"
}