use mongodb::bson::oid::ObjectId;
use serde::{Serialize, Deserialize};
use serde_json::to_string;
use crate::model::image_model::Image;
use crate::model::model_trait::Model;

/// Represents a user estimate.
///
/// # Fields
/// id: Renamed to _id and is used to store the MongoDB generated id
/// fName: First name of a user
/// lName: Last name of a user
/// email: Email of a user
/// strAddr: Street address of the user
/// city: City of the user
/// state: State the user lives in
/// zip: Zip code of the user
/// phoneNumber: The phone number of the user.
/// measurements: Any measurements the user wants the company to know about
/// details: Any details the user wants the company to know about
/// images: Any images the user wants the company to have. This is stored as references to the
/// images in the files system
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
    pub zip: String,
    pub phoneNumber: String,
    pub measurements: String,
    pub details: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub images: Option<Vec<Image>>
}

impl Model<UserEstimate> for UserEstimate {

    fn to_string(&self) -> String {
        to_string(self).unwrap()
    }
}
