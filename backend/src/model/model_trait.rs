use std::fmt::Debug;
use serde::{Serialize};
use serde::de::DeserializeOwned;

pub trait Model<T>: Serialize + DeserializeOwned + Debug + Unpin + Send + Sync {
    fn to_string(&self) -> String;
}