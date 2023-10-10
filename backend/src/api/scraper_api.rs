use std::process::{Command, Output, Stdio};
use actix_web::{get, HttpResponse};
use actix_web::web::Path;
use crate::model::scraper_model::Library;

///TEMPORARY
///Tests the webscraper api and how it pulls data
#[get("/scrape/{material}")]
pub async fn get_scraper_data(search: Path<String>) -> HttpResponse {
    let mut url = search.into_inner();
    url = url.replace('_', " ");
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
    let result_json = serde_json::from_str::<Library>(&data);
    match result_json {
        Ok(user) => HttpResponse::Ok().json(user),
        Err(err) => HttpResponse::InternalServerError()
            .body(err.to_string()),
    }
}