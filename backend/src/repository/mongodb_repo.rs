use std::env;
use std::process::exit;
use dotenv::dotenv;
use mongodb::{
    bson::{extjson::de::Error, doc, oid::ObjectId},
    results::{ InsertOneResult},
    options::ClientOptions,
    Client, Collection,
};
use futures::stream::TryStreamExt; //add this
use mongodb::results::{DeleteResult, UpdateResult};
use crate::model::user_model::UserEstimate;

pub struct MongoRepoUser {
    col: Collection<UserEstimate>,
}

impl MongoRepoUser {
    pub async fn init() -> Self {
        dotenv().ok();
        let database_address = match env::var("MONGOURL") {
            Ok(v) => v.to_string(),
            Err(_) => format!("Error loading env variable"),
        };
        let client_options = ClientOptions::parse(database_address).await;
        let mut client_options = match client_options {
            Ok(client_options) => client_options,
            Err(_) => {
                println!("Error: Could not parse address. Check the address rust is trying to connect to.");
                exit(1);
            }
        };

        client_options.app_name = Some("Job Estimator and Scheduler".to_string());

        let client = Client::with_options(client_options);
        let client = match client {
            Ok(client) => client,
            Err(_) => {
                println!("Error: Could not connect to the repository. Check if mongoDB is running.");
                exit(1);
            }
        };
        println!("Successfully connected to the database.");
        let db = client.database("ajseDB");
        let col: Collection<UserEstimate> = db.collection("users");
        MongoRepoUser { col }
    }

    pub async fn create_user_estimate(&self, new_user: UserEstimate) -> Result<InsertOneResult, Error> {
        let new_doc = UserEstimate {
            id: None,
            fName: new_user.fName.to_owned(),
            lName: new_user.lName.to_owned(),
            email: new_user.email.to_owned(),
            strAddr: new_user.strAddr.to_owned(),
            city: new_user.city.to_owned(),
            state: new_user.state.to_owned(),
            zip: new_user.zip.to_owned(),
            measurements: new_user.measurements.to_owned(),
            details: new_user.details.to_owned()
        };
        let user = self
            .col
            .insert_one(new_doc, None)
            .await
            .ok()
            .expect("Error creating user");
        Ok(user)
    }

    pub async fn get_user_estimate(&self, id: &String) -> Result<UserEstimate, Error> {
        let obj_id = ObjectId::parse_str(id).unwrap();
        let filter = doc! {"_id": obj_id};
        let user_detail = self
            .col
            .find_one(filter, None)
            .await
            .ok()
            .expect("Error getting user's detail");
        Ok(user_detail.unwrap())
    }

    pub async fn update_user_estimate(&self, id: &String, new_user: UserEstimate) -> Result<UpdateResult, Error> {
        let obj_id = ObjectId::parse_str(id).unwrap();
        let filter = doc! {"_id": obj_id};
        let new_doc = doc! {
                "$set":
                    {
                        "id": new_user.id,
                        "fName": new_user.fName,
                        "lName": new_user.lName,
                        "email": new_user.email,
                        "strAddr": new_user.strAddr,
                        "city": new_user.city,
                        "state": new_user.state,
                        "zip": new_user.zip,
                        "measurements": new_user.measurements,
                        "details": new_user.details

                    },
            };
        let updated_doc = self
            .col
            .update_one(filter, new_doc, None)
            .await
            .ok()
            .expect("Error updating user");
        Ok(updated_doc)
    }

    pub async fn delete_user_estimate(&self, id: &String) -> Result<DeleteResult, Error> {
        let obj_id = ObjectId::parse_str(id).unwrap();
        let filter = doc! {"_id": obj_id};
        let user_detail = self
            .col
            .delete_one(filter, None)
            .await
            .ok()
            .expect("Error deleting user");
        Ok(user_detail)
    }

    pub async fn get_all_user_estimates(&self) -> Result<Vec<UserEstimate>, Error> {
        let mut cursors = self
            .col
            .find(None, None)
            .await
            .ok()
            .expect("Error getting list of users");
        let mut users: Vec<UserEstimate> = Vec::new();
        while let Some(user) = cursors
            .try_next()
            .await
            .ok()
            .expect("Error mapping through cursor")
        {
            users.push(user)
        }
        Ok(users)
    }
}
