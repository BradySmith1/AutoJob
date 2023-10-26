use crate::{model::user_model::UserEstimate, repository::mongodb_repo::MongoRepo,
            model::upload_model::UploadForm};
use actix_web::{post, web::{Data, Json, Path}, HttpResponse, Error, get, Responder, put, delete};
use actix_multipart::{
    form::{
        MultipartForm,
    },
};
use actix_web::body::MessageBody;
use mongodb::bson::oid::ObjectId;
use serde_json::{json, Value};
use crate::api::api_helper::{delete_data, get_all_data, get_data, post_data, push_update};

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
    /*let mut value: Value = serde_json::from_str(&new_user).unwrap();
    if value["images"] == Value::Null || value["images"] == json!([]){
        value["images"] = Value::Null;
        new_user = serde_json::to_string(&value).unwrap();
        return post_data(&db, &new_user).await;
    }

    let images: Value = value["images"].to_owned();
    let images = images.as_array().unwrap();
    new_user = new_user.rsplit("\"images\"").collect::<Vec<&str>>()[1].trim_end_matches(
        |c| c == ' ' || c == ',' || c == '\n' || c == '\r' || c == '\t').to_string() + "\n}";

    let json = post_data(&db, &new_user).await.into_body().try_into_bytes().unwrap();

    let mut id = std::str::from_utf8(&json).unwrap();
    id = id.rsplit("\"").collect::<Vec<&str>>()[1];
    std::fs::create_dir_all("../images/".to_owned() + id).expect("Could not create directory");
    let mut image_vec: Vec<Value> = vec![];
    for image in images{
        let image_name = &*image["name"]
            .to_string().trim_end_matches("\"").trim_start_matches("\"").to_owned();
        let mut file = File::create("../images/".to_owned() + id + "/" + image_name)
            .expect("Could not create file");
        let _ = file.write_all(&*image["content"].to_string().trim_end_matches("\"")
            .trim_start_matches
        ("\"").as_bytes());
        image_vec.push(json!({"reference": "../images/".to_owned() + id + "/" + image_name}));
    }
    value["images"] = Value::from(image_vec);
    let json = serde_json::from_value(value).unwrap();
    let response = db.update_document(&id.to_string(), json).await;
    push_update(response, db, id.to_string()).await*/
    //might want to make this only return a id
}

async fn save_files(form: UploadForm, id: &str) -> Result<Vec<Value>,
    Error> {
    let mut image_vec: Vec<Value> = vec![];
    if form.files[0].size == 0 {
        return Ok(image_vec);
    }
    for f in form.files {
        let path = format!("../images/{}", id);
        std::fs::create_dir_all(&path).expect("Could not create directories");
        let path = format!("../images/{}/{}", id, f.file_name.unwrap());
        f.file.persist(&path).unwrap();
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