use actix_web::web::Json;
use mongodb::bson::oid::ObjectId;
use serde::{Serialize, Deserialize};

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

impl UserEstimate {
    /// Helper function to build a UserEstimate object from a JSON object.
    ///
    /// # Parameters
    ///
    /// new_user : A JSON object representing the user estimate to be created.
    ///
    /// # Returns
    ///
    /// A UserEstimate object representing the user estimate to be created.
    pub(crate) fn build_user(new_user: &Json<UserEstimate>) -> UserEstimate {
        UserEstimate {
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
        }
    }
}
