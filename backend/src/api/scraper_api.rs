use std::collections::HashMap;
use actix_web::{get, HttpResponse};
use actix_web::web::Query;
use serde_derive::{Deserialize, Serialize};

#[get("/scrape")]
pub async fn instant_web_scrape(query: Query<HashMap<String, String>>) -> HttpResponse {
    let map = query.into_inner();
    let name = match map.get("name"){
        Some(name) => name,
        None => return HttpResponse::BadRequest().body("Invalid name"),
    };
    let company = match map.get("company"){
        Some(company) => company,
        None => return HttpResponse::BadRequest().body("Invalid company"),
    };
    let scraper_data = get_scraper_data(name.to_string(), company.to_string()).await;
    HttpResponse::Ok().json(scraper_data)
}

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
pub async fn get_scraper_data(name: String, company: String) -> ScraperData {
    let url = std::env::var("WEB_CACHE_URL").unwrap();
    let client = reqwest::Client::new();
    let res = client.get(&url);
    let res = res.query(&[("name", name), ("company", company)]);
    let res = res.timeout(std::time::Duration::from_secs(5));
    let response = res.send().await.expect("Problem with the connection between the \
    backend and the frontend.");
    response.json::<ScraperData>().await.expect("No json was parsed")
}

#[derive(Deserialize, Serialize)]
pub struct ScraperData {
    pub name: String,
    pub price: String,
    pub company: String
}