use std::fmt::Debug;
use serde::{Serialize};
use serde::de::DeserializeOwned;

//Represents a trait that is used as a generic constraint for the MongoRepo structs.
pub trait Model<T>: Serialize + DeserializeOwned + Debug + Unpin + Send + Sync {
    fn to_string(&self) -> String;
}