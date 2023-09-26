use crate::{model::estimate_model::JobEstimate, repository::mongodb_estimate_repo::MongoRepoEstimate};
use actix_web::{post, web::{Data, Json, Path}, HttpResponse, get, put, delete};
use mongodb::bson::oid::ObjectId;

#[post("/estimate")]
pub async fn create_estimate(db: Data<MongoRepoEstimate>, new_user: Json<JobEstimate>) -> HttpResponse {
    println!("{:?}", &new_user);
    let data = build_user(&new_user);
    let user_detail = db.create_estimate(data).await;
    match user_detail {
        Ok(user) => HttpResponse::Ok().json(user),
        Err(err) => HttpResponse::InternalServerError().body(err.to_string()),
    }
}

#[get("/estimate/{id}")]
pub async fn get_estimate(db: Data<MongoRepoEstimate>, path: Path<String>) -> HttpResponse {
    let id = path.into_inner();
    if id.is_empty() {
        return HttpResponse::BadRequest().body("invalid ID");
    }
    let user_detail = db.get_estimate(&id).await;
    match user_detail {
        Ok(user) => HttpResponse::Ok().json(user),
        Err(err) => HttpResponse::InternalServerError().body(err.to_string()),
    }
}

#[put("/estimate/{id}")]
pub async fn update_estimate(
    db: Data<MongoRepoEstimate>,
    path: Path<String>,
    new_user: Json<JobEstimate>,
) -> HttpResponse {
    let id = path.into_inner();
    if id.is_empty() {
        return HttpResponse::BadRequest().body("invalid ID");
    };
    let data = JobEstimate {
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
        materials: new_user.materials.to_owned()
    };
    let update_result = db.update_estimate(&id, data).await;
    match update_result {
        Ok(update) => {
            if update.matched_count == 1 {
                let updated_user_info = db.get_estimate(&id).await;
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

#[delete("/estimate/{id}")]
pub async fn delete_estimate(db: Data<MongoRepoEstimate>, path: Path<String>) -> HttpResponse {
    let id = path.into_inner();
    if id.is_empty() {
        return HttpResponse::BadRequest().body("invalid ID");
    };
    let result = db.delete_estimate(&id).await;
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

#[get("/estimates")]
pub async fn get_all_estimates(db: Data<MongoRepoEstimate>) -> HttpResponse {
    let users = db.get_all_estimates().await;
    match users {
        Ok(users) => HttpResponse::Ok().json(users),
        Err(err) => HttpResponse::InternalServerError().body(err.to_string()),
    }
}

fn build_user(new_user: &Json<JobEstimate>) -> JobEstimate {
    JobEstimate {
        id: None,
        fName: new_user.fName.to_owned(),
        lName: new_user.lName.to_owned(),
        email: new_user.email.to_owned(),
        strAddr: new_user.strAddr.to_owned(),
        city: new_user.city.to_owned(),
        state: new_user.state.to_owned(),
        zip: new_user.zip.to_owned(),
        measurements: new_user.measurements.to_owned(),
        details: new_user.details.to_owned(),
        materials: new_user.materials.to_owned()
    }
}