use mongodb::bson::oid::ObjectId;
use serde_derive::{Deserialize, Serialize};
use serde_json::to_string;
use crate::model::model_trait::Model;

#[derive(Debug, Serialize, Deserialize)]
#[derive(Clone)]
#[allow(non_snake_case)]
pub struct RefreshToken {
    //the username can be either a username or an email.
    #[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
    pub id: Option<ObjectId>,
    pub user: String,
    pub jwt_token: String,
    pub exp: usize,
    pub refresh_token: String,
}


impl Model<RefreshToken> for RefreshToken {
    fn to_string(&self) -> String {
        to_string(self).unwrap()
    }
}