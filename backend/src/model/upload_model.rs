use actix_multipart::{
    form::{
        tempfile::{TempFile},
        MultipartForm,
    },
};
use actix_multipart::form::text::Text;

#[derive(Debug, MultipartForm)]
pub struct UploadForm {
    pub user: Text<String>,
    #[multipart(rename = "files")]
    pub files: Vec<TempFile>,
}