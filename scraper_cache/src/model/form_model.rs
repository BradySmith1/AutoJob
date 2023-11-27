use serde_derive::{Deserialize, Serialize};

/// Represents the data that will be sent from the server when a user wants to scrape a material.
///
/// # Fields
/// name: The name of the material that was scraped
/// company: The company that was scraped
#[derive(Debug, Serialize, Deserialize)]
pub struct ScraperForm{
    pub name: String,
    pub company: String
}