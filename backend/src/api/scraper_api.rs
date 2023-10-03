use std::process::{Command, Output, Stdio};
use actix_web::{HttpResponse, post};
use crate::model::scrape_model::Scraped;

///TEMPORARY
///Tests the webscraper api and how it pulls data
#[post("/scrape")]
pub async fn get_scraper_data(url: String) -> HttpResponse {
    let output: Output = Command::new("python3")
        .arg("./src/scraper/scraper.py")
        .arg(url)
        .stdout(Stdio::piped())
        .output()
        .expect("Could not run bash command");
    let data = String::from_utf8(output.stdout.clone()).unwrap();
    if data.clone().eq("No products found") {
        return HttpResponse::Ok().body(data);
    }
    let result_json = serde_json::from_str::<Scraped>(&data);
    match result_json {
        Ok(user) => HttpResponse::Ok().json(user),
        Err(err) => HttpResponse::InternalServerError()
            .body(err.to_string()),
    }
}