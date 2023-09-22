use mongodb::bson::oid::ObjectId;
use serde::{Serialize, Deserialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct UserEstimate {
    #[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
    pub id: Option<ObjectId>,
    pub first_name: String,
    pub last_name: String,
    pub email: String,
    pub street_address: String,
    pub city: String,
    pub state: String,
    pub zip: String, //might make this a int
    pub surfaces_square_footage: String,
    pub other_details: String
}
