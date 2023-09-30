use std::fmt::Debug;
use actix_web::web::Json;
use serde::{Serialize};
use serde::de::DeserializeOwned;

pub trait Model<T>: Serialize + DeserializeOwned + Debug + Unpin + Send + Sync {
    fn build_user(new_user: &Json<T>) -> T;
    fn to_string(&self) -> String;
}