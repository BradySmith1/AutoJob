use actix_web::web::Json;
use mongodb::bson::oid::ObjectId;
use serde_derive::{Deserialize, Serialize};
use serde_json::to_string;
use crate::model::model_trait::Model;

/// Represents one scrapped piece of data. This will be used to represent a scrape in the
/// scraped array.
#[derive(Debug, Serialize, Deserialize)]
#[derive(Clone)]
#[allow(non_snake_case)]
pub struct Library {
    pub available_products: Vec<Product>
}

/// Represents one scrapped piece of data. This will be used to represent a scrape in the
/// scraped array.
#[derive(Debug, Serialize, Deserialize)]
#[derive(Clone)]
#[allow(non_snake_case)]
pub struct Product {
    #[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
    pub id: Option<ObjectId>,
    pub name: String,
    pub price: f32
}

impl Model<Product> for Product {
    /// Helper function to build a UserEstimate object from a JSON object.
    ///
    /// # Parameters
    ///
    /// new_user : A JSON object representing the user estimate to be created.
    ///
    /// # Returns
    ///
    /// A UserEstimate object representing the user estimate to be created.
    fn build_user(new_user: &Json<Product>) -> Product {
        Product {
            id: None,
            name: new_user.name.to_owned(),
            price: new_user.price.to_owned()
        }
    }

    fn to_string(&self) -> String {
        to_string(self).unwrap()
    }
}