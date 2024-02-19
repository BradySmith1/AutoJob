use serde_derive::{Deserialize, Serialize};

/// Represents a login request. Holds the username and password of the user in the form of a string.
#[derive(Debug, Serialize, Deserialize)]
#[derive(Clone)]
pub struct LoginRequest {
    pub username: String,
    pub password: String
}

/// Represents a login response. Holds the JWT token in the form of a string.
#[derive(Debug, Serialize, Deserialize)]
#[derive(Clone)]
pub struct LoginResponse {
    pub token: String
}