use crate::{model::user_model::UserEstimate, repository::mongodb_repo::MongoRepoUser};
use actix_web::{post, web::{Data, Json, Path}, HttpResponse, get, Responder, put, delete};
use mongodb::bson::oid::ObjectId;

#[post("/user")]
pub async fn create_user(db: Data<MongoRepoUser>, new_user: Json<UserEstimate>) -> HttpResponse {
    let data = build_user(&new_user);
    let user_detail = db.create_user_estimate(data).await;
    match user_detail {
        Ok(user) => HttpResponse::Ok().json(user),
        Err(err) => HttpResponse::InternalServerError().body(err.to_string()),
    }
}

#[get("/user/{id}")]
pub async fn get_user(db: Data<MongoRepoUser>, path: Path<String>) -> HttpResponse {
    let id = path.into_inner();
    if id.is_empty() {
        return HttpResponse::BadRequest().body("invalid ID");
    }
    let user_detail = db.get_user_estimate(&id).await;
    match user_detail {
        Ok(user) => HttpResponse::Ok().json(user),
        Err(err) => HttpResponse::InternalServerError().body(err.to_string()),
    }
}

#[put("/user/{id}")]
pub async fn update_user(
    db: Data<MongoRepoUser>,
    path: Path<String>,
    new_user: Json<UserEstimate>,
) -> HttpResponse {
    let id = path.into_inner();
    if id.is_empty() {
        return HttpResponse::BadRequest().body("invalid ID");
    };
    let data = UserEstimate {
        id: Some(ObjectId::parse_str(&id).unwrap()),
        first_name: new_user.first_name.to_owned(),
        last_name: new_user.last_name.to_owned(),
        email: new_user.email.to_owned(),
        street_address: new_user.street_address.to_owned(),
        city: new_user.city.to_owned(),
        state: new_user.state.to_owned(),
        zip: new_user.zip.to_owned(),
        surfaces_square_footage: new_user.surfaces_square_footage.to_owned(),
        other_details: new_user.other_details.to_owned()
    };
    let update_result = db.update_user_estimate(&id, data).await;
    match update_result {
        Ok(update) => {
            if update.matched_count == 1 {
                let updated_user_info = db.get_user_estimate(&id).await;
                return match updated_user_info {
                    Ok(user) => HttpResponse::Ok().json(user),
                    Err(err) => HttpResponse::InternalServerError().body(err.to_string()),
                };
            } else {
                return HttpResponse::NotFound().body("No user found with specified ID");
            }
        }
        Err(err) => HttpResponse::InternalServerError().body(err.to_string()),
    }
}

#[delete("/user/{id}")]
pub async fn delete_user(db: Data<MongoRepoUser>, path: Path<String>) -> HttpResponse {
    let id = path.into_inner();
    if id.is_empty() {
        return HttpResponse::BadRequest().body("invalid ID");
    };
    let result = db.delete_user_estimate(&id).await;
    match result {
        Ok(res) => {
            if res.deleted_count == 1 {
                return HttpResponse::Ok().json("User successfully deleted!");
            } else {
                return HttpResponse::NotFound().json("User with specified ID not found!");
            }
        }
        Err(err) => HttpResponse::InternalServerError().body(err.to_string()),
    }
}

#[get("/users")]
pub async fn get_all_users(db: Data<MongoRepoUser>) -> HttpResponse {
    let users = db.get_all_user_estimates().await;
    match users {
        Ok(users) => HttpResponse::Ok().json(users),
        Err(err) => HttpResponse::InternalServerError().body(err.to_string()),
    }
}

#[get("/")]
async fn index() -> impl Responder {
    "Hello world!"
}

fn build_user(new_user: &Json<UserEstimate>) -> UserEstimate {
    UserEstimate {
        id: None,
        first_name: new_user.first_name.to_owned(),
        last_name: new_user.last_name.to_owned(),
        email: new_user.email.to_owned(),
        street_address: new_user.street_address.to_owned(),
        city: new_user.city.to_owned(),
        state: new_user.state.to_owned(),
        zip: new_user.zip.to_owned(),
        surfaces_square_footage: new_user.surfaces_square_footage.to_owned(),
        other_details: new_user.other_details.to_owned()
    }
}