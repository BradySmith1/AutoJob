use std::collections::HashMap;
use std::fmt::Display;
use mongodb::bson::oid::ObjectId;
use serde_derive::{Deserialize, Serialize};
use serde_json::to_string;
use crate::model::model_trait::Model;

/// Represents a material or fee. This will be used to represent a material or in the materials
/// array.
///
/// # Fields
/// id: Renamed to _id and is used to store the MongoDB generated id
/// name: The name of the material or fee
/// price: The price of a material/fee in the form of a f32 type
/// quantity: The quantity of the material/fee in the form of a f32 type
/// description: The description of the material/fee
/// autoImport: Either true or false. If true the material is auto imported into a estimate in the
/// frontend.
/// autoUpdate: Either false or true. If true the price will be auto updated in the background
/// ttl: the time to live of the material in the backend
/// company: Either lowes or homedepot
#[derive(Debug, Serialize, Deserialize)]
#[derive(Clone)]
#[allow(non_snake_case)]
pub struct Billable {
    #[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
    pub id: Option<ObjectId>,
    pub name: String,
    pub price: f32,
    pub quantity: f32,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub inputs: Option<HashMap<String, serde_json::Value>>,
    pub description: String,
    pub autoImport: String,
    pub autoUpdate: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub ttl: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub company: Option<String>, //will need to change this to the store or region later down the
    // line.
}


impl Model<Billable> for Billable {

    fn to_string(&self) -> String {
        to_string(self).unwrap()
    }
}