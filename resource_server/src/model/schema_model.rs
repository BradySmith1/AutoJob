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
    showInOverView: bool,
    required: bool,
}
