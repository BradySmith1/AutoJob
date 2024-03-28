use crate::model::model_trait::Model;
use serde_derive::{Deserialize, Serialize};
use serde_json::to_string;

/// The scraped array.
///
/// # Fields
/// available_products: A list of products available in a library
#[derive(Debug, Serialize, Deserialize, Clone)]
#[allow(non_snake_case)]
pub struct Library {
    pub available_products: Vec<Product>,
}

/// Represents one scrapped piece of data. This will be used to represent a scrape in the
/// scraped array.
///
/// # Fields
/// name: The name of a product
/// price: The price of a product in the form of a f32 type
#[derive(Debug, Serialize, Deserialize, Clone)]
#[allow(non_snake_case)]
pub struct Product {
    pub name: String,
    pub price: f32,
}

impl Model<Product> for Product {
    fn to_string(&self) -> String {
        to_string(self).unwrap()
    }
}
