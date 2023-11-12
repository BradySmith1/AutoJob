use serde_derive::{Deserialize, Serialize};
#[derive(Debug, Serialize, Deserialize)]
pub struct ScraperForm{
    pub name: String,
    pub company: String
}