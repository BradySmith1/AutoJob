use mongodb::bson::oid::ObjectId;
use serde_derive::{Deserialize, Serialize};
use serde_json::to_string;
use crate::model::model_trait::Model;

/// Represents one scrapped piece of data. This will be used to represent a scrape in the
/// scraped array.
#[derive(Debug, Serialize, Deserialize)]
#[derive(Clone)]
#[allow(non_snake_case)]
pub struct ScraperLibrary {
    pub available_products: Vec<ScraperProduct>
}

/// Represents one scrapped piece of data. This will be used to represent a scrape in the
/// scraped array.
#[derive(Debug, Serialize, Deserialize)]
#[derive(Clone)]
#[allow(non_snake_case)]
pub struct ScraperProduct {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub id: Option<ObjectId>,
    pub name: String,
    pub price: f32
}

/// Represents one scrapped piece of data. This will be used to represent a scrape in the
/// scraped array.
///
/// # Fields
/// id: The id of the product in relation to the MongoDB database
/// name: The name of the product
/// price: The price of the product in the form of a f32 type
/// company: The company that the product is from
/// ttl: The time to live of the product
#[derive(Debug, Serialize, Deserialize)]
#[derive(Clone)]
#[allow(non_snake_case)]
pub struct Product {
    #[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
    pub id: Option<ObjectId>,
    pub name: String,
    pub price: f32,
    pub company: String,
    pub ttl: String
}

impl Model<ScraperProduct> for ScraperProduct {

    fn to_string(&self) -> String {
        to_string(self).unwrap()
    }
}

impl Model<Product> for Product {

    fn to_string(&self) -> String {
        to_string(self).unwrap()
    }
}