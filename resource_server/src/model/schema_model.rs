use serde_derive::{Deserialize, Serialize};
use serde_json::to_string;
use crate::model::model_trait::Model;

#[derive(Debug, Serialize, Deserialize)]
#[derive(Clone)]
#[allow(non_snake_case)]
pub struct Schema {
    #[serde(rename = "")]
    schemas : Vec<Scheme>,
}

impl Model<Schema> for Schema {
    fn to_string(&self) -> String {
        to_string(self).unwrap()
    }
}

#[derive(Debug, Serialize, Deserialize)]
#[derive(Clone)]
#[allow(non_snake_case)]
pub struct Scheme {
    estimateType: String,
    form: Vec<SchemeLayout>
}


#[derive(Debug, Serialize, Deserialize)]
#[derive(Clone)]
#[allow(non_snake_case)]
struct SchemeLayout{
    canonicalName: String,
    fields: Vec<FieldLayout>
}

#[derive(Debug, Serialize, Deserialize)]
#[derive(Clone)]
#[allow(non_snake_case)]
struct FieldLayout {
    name: String,
    unit: String,
    showInOverView: bool,
    required: bool,
}
