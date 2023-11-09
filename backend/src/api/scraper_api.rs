use serde_derive::{Deserialize};

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
pub async fn get_scraper_data(Name: String, Store: String) -> ScraperData {
    let url = std::env::var("WEB_CACHE_URL").unwrap();
    let client = reqwest::Client::new();
    let res = client.get(&url);
    let res = res.query(&[("Name", Name), ("Store", Store)]);
    let response = res.send().await.expect("Problem with the connection between the \
    backend and the frontend.");
    response.json::<ScraperData>().await.expect("No json was parsed")
}

#[derive(Deserialize)]
pub struct ScraperData {
    name: String,
    price: String
}