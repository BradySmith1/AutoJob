use serde_derive::{Deserialize, Serialize};
use crate::model::product_model::Product;

/// Represents one scrapped piece of data. This will be used to represent a scrape in the
/// scraped array.
#[derive(Debug, Serialize, Deserialize)]
#[derive(Clone)]
#[allow(non_snake_case)]
pub struct Scraped {
    pub available_products: Vec<Product>
}