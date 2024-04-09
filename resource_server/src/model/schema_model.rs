use crate::model::model_trait::Model;
use mongodb::bson::oid::ObjectId;
use rand::distributions::Alphanumeric;
use rand::Rng;
use serde_derive::{Deserialize, Serialize};
use serde_json::to_string;

fn default_schema() -> Schema {
    Schema {
        estimateType: "Default".to_string(),
        presetID: generate_id(),
        form: vec![
            SchemeLayout {
                canonicalName: "Materials".to_string(),
                stageID: generate_id(),
                fields: vec![
                    FieldLayout {
                        name: "Name".to_string(),
                        unit: "Text".to_string(),
                        showInOverview: true,
                        required: Some(true),
                    },
                    FieldLayout {
                        name: "Price".to_string(),
                        unit: "Number".to_string(),
                        showInOverview: true,
                        required: Some(true),
                    },
                    FieldLayout {
                        name: "Quantity".to_string(),
                        unit: "Number".to_string(),
                        showInOverview: true,
                        required: None,
                    },
                ],
            },
            SchemeLayout {
                canonicalName: "Fees".to_string(),
                stageID: generate_id(),
                fields: vec![
                    FieldLayout {
                        name: "Name".to_string(),
                        unit: "Text".to_string(),
                        showInOverview: true,
                        required: Some(true),
                    },
                    FieldLayout {
                        name: "Price".to_string(),
                        unit: "Number".to_string(),
                        showInOverview: true,
                        required: Some(true),
                    },
                    FieldLayout {
                        name: "Quantity".to_string(),
                        unit: "Number".to_string(),
                        showInOverview: true,
                        required: None,
                    },
                ],
            },
        ],
    }
}

fn generate_id() -> String {
    let id: String = rand::thread_rng()
        .sample_iter(&Alphanumeric)
        .take(16)
        .map(char::from)
        .collect();
    id
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[allow(non_snake_case)]
pub struct Schema {
    estimateType: String,
    pub presetID: String,
    pub form: Vec<SchemeLayout>,
}

impl Default for Schema {
    fn default() -> Self {
        default_schema()
    }
}

impl Model<Schema> for Schema {
    fn to_string(&self) -> String {
        to_string(self).unwrap()
    }
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[allow(non_snake_case)]
pub struct SchemeLayout {
    canonicalName: String,
    pub stageID: String,
    fields: Vec<FieldLayout>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[allow(non_snake_case)]
struct FieldLayout {
    name: String,
    unit: String,
    showInOverview: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    required: Option<bool>,
}
