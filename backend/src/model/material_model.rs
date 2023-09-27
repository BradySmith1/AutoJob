use serde_derive::{Deserialize, Serialize};

/// Represents a material. This will be used to represent a material in the materials array.
#[derive(Debug, Serialize, Deserialize)]
#[derive(Clone)]
#[allow(non_snake_case)]
pub struct Material {
    pub material_type: String,
    pub price: f32,
    pub quantity: f32
}