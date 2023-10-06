use serde_derive::{Deserialize, Serialize};

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