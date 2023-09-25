use serde_derive::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
#[derive(Clone)]
#[allow(non_snake_case)]
pub struct Material {
    pub material_type: String,
    pub price: f32,
    pub quantity: f32
}