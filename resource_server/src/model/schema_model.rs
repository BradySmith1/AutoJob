use mongodb::bson::oid::ObjectId;
use serde_derive::{Deserialize, Serialize};
use serde_json::to_string;
use crate::model::model_trait::Model;

#[derive(Debug, Serialize, Deserialize)]
#[derive(Clone)]
#[allow(non_snake_case)]
pub struct Schema {
    #[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
    pub id: Option<ObjectId>,
    #[serde(default = "default_schema", skip_serializing_if = "Vec::is_empty")]
    pub schemas : Vec<Scheme>,
}

impl Model<Schema> for Schema {
    fn to_string(&self) -> String {
        to_string(self).unwrap()
    }
}

fn default_schema() -> Vec<Scheme> {
    let mut schemas = Vec::<Scheme>::new();
    let default_scheme = Scheme {
        estimateType: "Default".to_string(),
        form: vec![
            SchemeLayout {
                canonicalName: "Materials".to_string(),
                fields: vec![
                    FieldLayout {
                        name: "Name".to_string(),
                        unit: "Text".to_string(),
                        showInOverView: true,
                        required: true,
                    },
                    FieldLayout {
                        name: "Price".to_string(),
                        unit: "Number".to_string(),
                        showInOverView: true,
                        required: true,
                    },
                    FieldLayout {
                        name: "Quantity".to_string(),
                        unit: "Number".to_string(),
                        showInOverView: true,
                        required: true,
                    }
                ]
            },

            SchemeLayout {
                canonicalName: "Fees".to_string(),
                fields: vec![
                    FieldLayout {
                        name: "Name".to_string(),
                        unit: "Text".to_string(),
                        showInOverView: true,
                        required: true,
                    },
                    FieldLayout {
                        name: "Price".to_string(),
                        unit: "Number".to_string(),
                        showInOverView: true,
                        required: true,
                    },
                    FieldLayout {
                        name: "Quantity".to_string(),
                        unit: "Number".to_string(),
                        showInOverView: true,
                        required: true,
                    }
                ]
            },
        ]
    };
    schemas.push(default_scheme);
    schemas
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
