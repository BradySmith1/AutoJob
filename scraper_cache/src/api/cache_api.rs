use actix_web::{web::{Data}, HttpResponse, get};
use crate::repository::mongodb_repo::MongoRepo;
use crate::model::form_model::ScraperForm;
use actix_web::web::Query;

#[get("/cache")]
pub async fn get_cached_materials(cache: Data<MongoRepo<Product>>, query:
Query<ScraperForm>) ->
                                                                                     HttpResponse {
    //Form comes in format of {name: {}, store: {}}
    let returned_materials = match cache.
        get_documents_by_attribute(&query).await {
        Ok(materials) => materials,
        Err(_) => {
            println!("No documents in the cache. Proceeding to scraping.");
            Vec::<Product>::new()
        }
    };
    if returned_materials.len() == 0 {
        let material = match get_scraper_data(&query.company,
                                              &query.name).await{
            Ok(material) => material,
            Err(string) => {
                if string.eq("No Products Found") || string.eq("EOF while parsing a value at line 1 column 0"){
                    return HttpResponse::NotFound().finish();
                }
                println!("{}", string);
                return HttpResponse::InternalServerError().body(string);
            }
        };
        let _ = cache.create_document(material.clone()).await.unwrap();
        HttpResponse::Ok().json(material)
    }else{
        HttpResponse::Ok().json(returned_materials[0].clone())
    }
}

use std::process::{Command, Output, Stdio};
use crate::model::scraper_model::{Product, ScraperLibrary};

pub async fn get_scraper_data(company: &String, material: &String) -> Result<Product,
    String> {
    //runs the python script and gets the output
    let output: Output = Command::new("python3")
        .arg("./src/scraper/scraper.py")
        .arg(company)
        .arg(material)
        .stdout(Stdio::piped())
        .output()
        .expect("Could not run bash command");

    //converts the output to a string
    let data = String::from_utf8(output.stdout.clone()).unwrap();
    if data.clone().eq("No products found") {
        return Err("No Products Found".to_string());
    }

    //println!("{}", &data);
    //converts the string to a Library object and returns the requests data.
    let result_json = match serde_json::from_str::<ScraperLibrary>(&data) {
        Ok(user) => user,
        Err(err) => return Err(err.to_string()),
    };

    //TODO might want to change this but should work right now.
    let mut product = result_json.available_products[0].clone();
    product.name = product.name.replace(" ", "_");
    Ok(Product {
        id: None,
        name: material.clone(),
        price: product.price,
        company: company.clone()
    })
}