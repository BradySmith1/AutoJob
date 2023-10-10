use std::collections::HashMap;
use mongodb::bson::oid::ObjectId;
use serde_derive::{Deserialize, Serialize};
use serde_json::to_string;
use crate::model::library_model::MaterialFee;
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
    #[serde(skip_serializing_if = "Option::is_none")]
    pub materials: Option<Vec<MaterialFee>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub fees: Option<Vec<MaterialFee>>
}
impl Model<JobEstimate> for JobEstimate{

    fn to_string(&self) -> String{
        to_string(self).unwrap()
    }
}
