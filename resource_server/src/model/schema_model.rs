use mongodb::bson::oid::ObjectId;
use serde_derive::{Deserialize, Serialize};
use serde_json::to_string;
use crate::model::model_trait::Model;


fn default_schema() -> Schema {
    Schema {
        estimateType: "Default".to_string(),
        form: vec![
            SchemeLayout {
                canonicalName: "Materials".to_string(),
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
                    }
                ]
            },

            SchemeLayout {
                canonicalName: "Fees".to_string(),
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
                    }
                ]
            },
        ]
    }

}

#[derive(Debug, Serialize, Deserialize)]
#[derive(Clone)]
#[allow(non_snake_case)]
pub struct Schema {
    estimateType: String,
    form: Vec<SchemeLayout>
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
    showInOverview: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    required: Option<bool>,
}
