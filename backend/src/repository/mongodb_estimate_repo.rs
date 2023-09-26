use std::env;
use std::process::exit;
use dotenv::dotenv;
use mongodb::{bson::{extjson::de::Error, doc, oid::ObjectId}, results::{InsertOneResult}, options::ClientOptions, Client, Collection, bson};
use futures::stream::TryStreamExt; //add this
use mongodb::results::{DeleteResult, UpdateResult};
use crate::model::estimate_model::JobEstimate;

/// A struct representing a MongoDB repository for job estimates.
///
/// # Fields
///
/// col : A Collection of type JobEstimate that provides methods for
///  querying data in the MongoDB database.
pub struct MongoRepoEstimate {
    col: Collection<JobEstimate>,
}


/// Implementation of the MongoRepoEstimate struct.
impl MongoRepoEstimate {

    /// Initialize a MongoDB repository for job estimates.
    ///
    /// # Returns
    ///
    /// Returns a MongoRepoEstimate struct containing a MongoDB collection for job estimates.
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
                println!("Error: Could not parse address. Check the address rust is trying to \
                connect to.");
                exit(1);
            }
        };

        client_options.app_name = Some("Job Estimator and Scheduler".to_string());

        let client = Client::with_options(client_options);
        let client = match client {
            Ok(client) => client,
            Err(_) => {
                println!("Error: Could not connect to the repository. Check if mongoDB is \
                running.");
                exit(1);
            }
        };
        println!("Successfully connected to the job estimate database.");
        let db = client.database("ajseDB");
        let col: Collection<JobEstimate> = db.collection("jobEstimates");
        MongoRepoEstimate { col }
    }

    /// This function creates a new job estimate from the jobEstimate collection.
    ///
    /// # Arguments
    ///
    /// new_user: A reference to a JobEstimate struct that will be inserted into the MongoDB
    /// collection
    ///
    /// # Returns
    ///
    /// Returns a Result containing the inserted document if successful, or an Error if there are
    /// any issues with the insertion.
    ///
    /// # Panics
    ///
    /// This function may panic if there are errors in parsing the provided ID string or
    /// if there are issues with the MongoDB query.
    pub async fn create_estimate(&self, new_user: JobEstimate) -> Result<InsertOneResult, Error> {
        let new_doc = build_user(&new_user);
        let user = self
            .col
            .insert_one(new_doc, None)
            .await
            .ok()
            .expect("Error creating user");
        Ok(user)
    }


    /// Retrieve a job estimate from the jobEstimate collection by its ID.
    ///
    /// This function queries the MongoDB repository for a job estimate document
    /// matching the specified ID. If a matching document is found, it is returned
    /// as a Result containing the JobEstimate. If no matching document is found,
    /// or if there are any errors during the retrieval process, an `Error` is returned.
    ///
    /// # Arguments
    ///
    /// id : A reference to a String representing the ID of the job estimate to retrieve.
    ///
    /// # Returns
    ///
    /// Returns a Result containing the retrieved JobEstimate if successful, or an
    /// Error if there are any issues with the retrieval.
    ///
    /// # Panics
    ///
    /// This function may panic if there are errors in parsing the provided ID string or
    /// if there are issues with the MongoDB query.
    pub async fn get_estimate(&self, id: &String) -> Result<JobEstimate, Error> {
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

    /// Update a job estimate from the jobEstimate collection.
    ///
    ///
    /// # Arguments
    ///
    /// id : A reference to a String representing the ID of the job estimate to update.
    ///
    /// new_user: A reference to a JobEstimate struct containing the updated data for the job
    /// estimate.
    ///
    /// # Returns
    ///
    /// Returns a Result containing the updated JobEstimate if successful, or an
    /// Error if there are any issues with the update.
    ///
    /// # Panics
    ///
    /// This function may panic if there are errors in parsing the provided ID string or
    /// if there are issues with the MongoDB query.
    pub async fn update_estimate(&self, id: &String, new_user: JobEstimate) -> Result<UpdateResult, Error> {
        let obj_id = ObjectId::parse_str(id).unwrap();
        let filter = doc! {"_id": obj_id};
        let new_doc = build_user(&new_user);
        let doc = bson::to_document(&new_doc).unwrap();
        let updated_doc = self
            .col
            .update_one(filter, doc, None)
            .await
            .ok()
            .expect("Error updating user");
        Ok(updated_doc)
    }

    /// Delete a job estimate from the jobEstimate collection.
    ///
    /// # Arguments
    ///
    /// id : A reference to a String representing the ID of the job estimate to delete.
    ///
    /// # Returns
    ///
    /// Returns a Result containing the DeleteResult if successful, or an
    /// Error if there are any issues with the deletion.
    ///
    /// # Panics
    ///
    /// This function may panic if there are errors in parsing the provided ID string or
    /// if there are issues with the MongoDB query.
    pub async fn delete_estimate(&self, id: &String) -> Result<DeleteResult, Error> {
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

    /// Retrieve all job estimates from the jobEstimate collection.
    ///
    /// # Returns
    ///
    /// Returns a Result containing a vector of all JobEstimates if successful, or an
    /// Error if there are any issues with the retrieval.
    ///
    /// # Panics
    ///
    /// This function may panic if there are issues with the MongoDB query.
    pub async fn get_all_estimates(&self) -> Result<Vec<JobEstimate>, Error> {
        let mut cursors = self
            .col
            .find(None, None)
            .await
            .ok()
            .expect("Error getting list of users");
        let mut users: Vec<JobEstimate> = Vec::new();
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

/// This function builds a new JobEstimate struct from the provided JobEstimate struct.
///
/// # Arguments
///
/// new_user: A reference to a JobEstimate struct that will be inserted into the MongoDB
/// collection
///
/// # Returns
///
/// Returns a JobEstimate struct containing the data from the provided JobEstimate struct.
fn build_user(new_user: &JobEstimate) -> JobEstimate {
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