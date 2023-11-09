use std::collections::HashMap;
use actix_web::{HttpResponse};
use actix_web::web::{ Query};

/// Retrieve scraper data by material via a GET request.
///
/// # Parameters
///
/// search: A Path object containing the material to be searched for.
///
/// # Returns
///
/// An HttpResponse representing the result of the operation. If the material is found,
/// it returns an HTTP 200 OK response with the JSON representation of the library data.
/// If the provided material is empty or there's an error during the retrieval process, it
/// returns an HTTP 400 Bad Request response with
/// an error message or an HTTP 500 Internal Server Error response with an error message.
pub async fn get_scraper_data(Name: String, Store: String) -> HttpResponse {
    let url = std::env::var("WEB_CACHE_URL").unwrap();
    let client = reqwest::Client::new();
    let res = client.get(&url);
    let res = res.query(&[("Name", Name), ("Store", Store)]);
    match res.send().await {
        Ok(res) => {
            let body = res.text().await.unwrap();
            HttpResponse::Ok().body(body)
        }
        Err(err) => {
            HttpResponse::InternalServerError().body(err.to_string())
        }
    }
}