use mongodb::bson::oid::ObjectId;
use serde_derive::{Deserialize, Serialize};
use crate::model::material_model::Material;

/// Represents a job estimate. This is the model that will be used to create JSON objects.
#[derive(Debug, Serialize, Deserialize)]
#[allow(non_snake_case)]
pub struct JobEstimate {
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
    pub details: String,
    pub materials: Vec<Material>
}