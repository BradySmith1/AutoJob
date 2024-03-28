use crate::model::model_trait::Model;
use mongodb::bson::oid::ObjectId;
use serde_derive::{Deserialize, Serialize};
use serde_json::to_string;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct JWT {
    #[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
    pub(crate) id: Option<ObjectId>,
    pub(crate) userid: String,
    pub(crate) issuerid: String,
    pub(crate) exp: usize,
    pub(crate) jwt_raw: String,
}

#[derive(Serialize, Deserialize)]
pub struct Claims {
    pub(crate) userid: String,
    pub(crate) issuerid: String,
    pub(crate) exp: usize,
}

impl Model<JWT> for JWT {
    fn to_string(&self) -> String {
        to_string(self).unwrap()
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct JSONToken {
    pub(crate) jwt_token: String,
}
