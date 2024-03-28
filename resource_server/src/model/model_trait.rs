use serde::de::DeserializeOwned;
use serde::Serialize;
use std::fmt::Debug;

//Represents a trait that is used as a generic constraint for the MongoRepo structs.
pub trait Model<T>: Serialize + DeserializeOwned + Debug + Unpin + Send + Sync {
    fn to_string(&self) -> String;
}
