use mongodb::bson::oid::ObjectId;
use serde::{Serialize, Deserialize};
use serde_json::to_string;
use crate::model::model_trait::Model;

/// Represents a user estimate. This is the model that will be used to create JSON objects.
#[derive(Debug, Serialize, Deserialize)]
#[allow(non_snake_case)]
pub struct UserEstimate {
    #[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
    pub id: Option<ObjectId>,
    pub fName: String,
    pub lName: String,
    pub email: String,
    pub strAddr: String,
    pub city: String,
    pub state: String,
    pub zip: String, //might make this a int
    pub measurements: String,
    pub details: String
}

impl Model<UserEstimate> for UserEstimate {

    fn to_string(&self) -> String {
        to_string(self).unwrap()
    }
}
