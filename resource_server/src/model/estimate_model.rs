use crate::model::billable_model::Billable;
use crate::model::model_trait::Model;
use crate::model::schema_model::Schema;
use crate::model::user_model::UserEstimate;
use mongodb::bson::oid::ObjectId;
use serde_derive::{Deserialize, Serialize};
use serde_json::to_string;
use std::collections::HashMap;

/// Represents a job estimate. This is the model that will be used to create JSON objects.
///
/// # Fields
/// id: Renamed to _id and is used to store the MongoDB generated id
/// user: A UserEstimate Struct
/// materials: A list of MaterialFee structs that are materials, if there are any.
/// fees: A list of MaterialFee structs that are fees, if there are any.
/// status: The status of the job estimate. Either a draft of a completed estimate.
#[derive(Debug, Serialize, Deserialize, Clone)]
#[allow(non_snake_case)]
pub struct JobEstimate {
    #[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
    pub id: Option<ObjectId>,
    pub user: UserEstimate,
    pub form: Vec<HashMap<String, Vec<Billable>>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub schema: Option<Schema>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub date: Option<String>,
    pub status: String,
}
impl Model<JobEstimate> for JobEstimate {
    fn to_string(&self) -> String {
        to_string(self).unwrap()
    }
}
