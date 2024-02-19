use mongodb::bson::oid::ObjectId;
use serde_derive::{Deserialize, Serialize};
use serde_json::to_string;
use crate::model::model_trait::Model;

/// Represents a user. This will be used to represent a user in the users array.
#[derive(Debug, Serialize, Deserialize)]
#[derive(Clone)]
#[allow(non_snake_case)]
pub struct User {
    //the username can be either a username or an email.
    #[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
    pub id: Option<ObjectId>,
    pub username: String,
    pub hashed_password: String,
    pub date_created: String
}


impl Model<User> for User {
    fn to_string(&self) -> String {
        to_string(self).unwrap()
    }
}