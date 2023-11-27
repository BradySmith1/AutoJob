use actix_multipart::{
    form::{
        tempfile::{TempFile},
        MultipartForm,
    },
};
use actix_multipart::form::text::Text;

/// A struct for the uploading of a userEstimate with images.
///
/// # Fields
/// user: The userEstimate object in the format of a JSON but passed in as a string and parsed.
/// files: The list of possible images being sent.
#[derive(Debug, MultipartForm)]
pub struct UserEstimateUploadForm {
    pub user: Text<String>,
    #[multipart(rename = "files")]
    pub files: Vec<TempFile>,
}