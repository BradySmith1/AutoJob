use serde_derive::{Deserialize, Serialize};
use serde_json::to_string;
use crate::model::model_trait::Model;

#[derive(Debug, Serialize, Deserialize)]
#[derive(Clone)]
pub struct JWT{
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
    pub(crate) jwt_token: String
}