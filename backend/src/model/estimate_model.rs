use std::collections::HashMap;
use actix_web::web::Json;
use mongodb::bson::oid::ObjectId;
use serde_derive::{Deserialize, Serialize};
use crate::model::material_model::Material;
use crate::model::model_trait::Model;
use crate::model::user_model::UserEstimate;

/// Represents a job estimate. This is the model that will be used to create JSON objects.
#[derive(Debug, Serialize, Deserialize)]
#[allow(non_snake_case)]
pub struct JobEstimate {
    #[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
    pub id: Option<ObjectId>,
    #[serde(flatten)]
    pub user: HashMap<String, UserEstimate>,
    pub materials: Vec<Material>
}
impl Model<JobEstimate> for JobEstimate{
    fn build_user(_new_user: &Json<JobEstimate>) -> JobEstimate {
        JobEstimate {
            id: None,
            user: Default::default(),
            materials: vec![],
        }
    }
}