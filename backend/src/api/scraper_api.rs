use std::process::{Command, Output, Stdio};
use actix_web::{get, HttpResponse};
use actix_web::web::Path;
use crate::model::scraper_model::Library;

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
#[get("/scrape/{company}/{material}")]
pub async fn get_scraper_data(search: Path<(String, String)>) -> HttpResponse {
    //formats the string to be used in the python script
    let (company, material) = search.into_inner();
    //todo fix this if statement it is not efficient
    if company.eq("homedepot") || company.eq("lowes") {
    }else{
        return HttpResponse::BadRequest().body("invalid company");
    }
    let material_parsed = material.replace('_', " ");

    //runs the python script and gets the output
    let output: Output = Command::new("python3")
        .arg("./src/scraper/scraper.py")
        .arg(company)
        .arg(material_parsed)
        .stdout(Stdio::piped())
        .output()
        .expect("Could not run bash command");

    //converts the output to a string
    let data = String::from_utf8(output.stdout.clone()).unwrap();
    if data.clone().eq("No products found") {
        return HttpResponse::Ok().body(data);
    }

    //converts the string to a Library object and returns the requests data.
    let result_json = serde_json::from_str::<Library>(&data);
    match result_json {
        Ok(user) => HttpResponse::Ok().json(user),
        Err(err) => HttpResponse::InternalServerError()
            .body(err.to_string()),
    }
}