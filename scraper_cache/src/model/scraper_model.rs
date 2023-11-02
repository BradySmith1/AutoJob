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
    pub name: String,
    pub price: f32
}

impl Model<Product> for Product {

    fn to_string(&self) -> String {
        to_string(self).unwrap()
    }
}