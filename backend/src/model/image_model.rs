use serde_derive::{Deserialize, Serialize};
use serde_json::to_string;
use crate::model::model_trait::Model;

/// Represents an image. Holds the reference to the image in the file system.
///
/// # Fields
/// reference: The reference to the file path in the system.
#[derive(Debug, Serialize, Deserialize)]
#[derive(Clone)]
#[allow(non_snake_case)]
pub struct Image {
    pub reference: String
}

impl Model<Image> for Image {

    fn to_string(&self) -> String {
        to_string(self).unwrap()
    }
}