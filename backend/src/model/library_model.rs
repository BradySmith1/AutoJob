use mongodb::bson::oid::ObjectId;
use serde_derive::{Deserialize, Serialize};
use serde_json::to_string;
use chrono::{Utc};
use crate::model::model_trait::Model;

/// Represents a material. This will be used to represent a material in the materials array.
#[derive(Debug, Serialize, Deserialize)]
#[derive(Clone)]
#[allow(non_snake_case)]
pub struct MaterialFee {
    #[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
    pub id: Option<ObjectId>,
    pub name: String,
    pub price: f32,
    pub quantity: f32,
    pub description: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub auto_update: Option<String>,
    #[serde(default = "default_ttl", skip_serializing)]
    pub ttl: String,
}

fn default_ttl() -> String {
    (Utc::now() + chrono::Duration::days(7)).to_string()
}

impl Model<MaterialFee> for MaterialFee {

    fn to_string(&self) -> String {
        to_string(self).unwrap()
    }
}