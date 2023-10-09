use actix_web::web::Json;
use mongodb::bson::oid::ObjectId;
use serde_derive::{Deserialize, Serialize};
use serde_json::to_string;
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
    pub description: String
}

impl Model<MaterialFee> for MaterialFee {
    /// Helper function to build a UserEstimate object from a JSON object.
    ///
    /// # Parameters
    ///
    /// new_user : A JSON object representing the user estimate to be created.
    ///
    /// # Returns
    ///
    /// A UserEstimate object representing the user estimate to be created.
    fn build_user(new_user: &Json<MaterialFee>) -> MaterialFee {
        MaterialFee {
            id: None,
            name: new_user.name.to_owned(),
            price: new_user.price.to_owned(),
            quantity: new_user.quantity.to_owned(),
            description: new_user.description.to_owned()
        }
    }

    fn to_string(&self) -> String {
        to_string(self).unwrap()
    }
}