use std::env;
use std::process::exit;
use dotenv::dotenv;
use mongodb::{bson::{extjson::de::Error, doc, oid::ObjectId}, results::{InsertOneResult}, options::ClientOptions, Client, Collection, bson};
use futures::stream::TryStreamExt; //add this
use mongodb::results::{DeleteResult, UpdateResult};
use crate::model::user_model::UserEstimate;

/// A struct representing a MongoDB repository for user estimates.
pub struct MongoRepoUser {
    col: Collection<UserEstimate>,
}

/// Implementation of the MongoRepoUser struct.
impl MongoRepoUser {

    /// Initialize a MongoDB repository for user estimates.
    ///
    /// # Returns
    ///
    /// Returns a MongoRepoUser struct containing a MongoDB collection for user estimates.
    ///
    /// # Panics
    ///
    /// This function may panic if there are errors during environment variable loading,
    /// connection URL parsing, or if it cannot establish a connection to the MongoDB server.
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
        println!("Successfully connected to the user estimate database.");
        let db = client.database("ajseDB");
        let col: Collection<UserEstimate> = db.collection("userEstimates");
        MongoRepoUser { col }
    }

    /// This function creates a new user estimate in the userEstimate collection.
    ///
    /// # Parameters
    ///
    ///  new_user : A UserEstimate struct that contains the user's estimate information.
    ///
    /// # Returns
    ///
    /// Returns a Result containing the InsertOneResult or an error.
    ///
    /// # Panics
    ///
    /// This function may panic if there are errors during the insert operation.
    pub async fn create_user_estimate(&self, new_user: UserEstimate) -> Result<InsertOneResult, Error> {
        let user = self
            .col
            .insert_one(&new_user, None)
            .await
            .ok()
            .expect("Error creating user");
        Ok(user)
    }

    /// Retrieve a user estimate from the userEstimate collection by its ID.
    ///
    /// # Parameters
    ///
    /// id : A string representing the ID of the user estimate to retrieve.
    ///
    /// # Returns
    ///
    /// Returns a Result containing the retrieved user estimate or an error.
    ///
    /// # Panics
    ///
    /// This function may panic if there are errors in parsing the provided ID string or
    /// if there are issues with the MongoDB query.
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
        let doc = bson::to_document(&new_user).unwrap();
        let updated_doc = self
            .col
            .update_one(filter, doc, None)
            .await
            .ok()
            .expect("Error updating user");
        Ok(updated_doc)
    }

    /// Delete a user estimate from the userEstimate collection based on the objectID.
    ///
    /// # Arguments
    ///
    /// id : A reference to a String representing the ID of the job estimate to delete.
    ///
    /// # Returns
    ///
    /// Returns a Result containing the deleted JobEstimate if successful, or an
    /// Error if there are any issues with the deletion.
    ///
    /// # Panics
    ///
    /// This function may panic if there are errors in parsing the provided ID string or
    /// if there are issues with the MongoDB query.
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

    /// Retrieve all user estimates from the userEstimate collection.
    ///
    /// # Returns
    ///
    /// Returns a Result containing a vector of all user estimates or an error.
    ///
    /// # Panics
    ///
    /// This function may panic if there are issues with the MongoDB query.
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
