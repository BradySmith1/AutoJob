use actix_web::{web::{Data}, HttpResponse, get};
use crate::repository::mongodb_repo::MongoRepo;
use crate::model::form_model::ScraperForm;
use actix_web::web::Query;

/// Does two things, either gets the cached data from the database or scrapes the data and caches
/// it to the database
///
/// # Parameters
/// cache: The cache that will be used to store the data
/// query: The query that will be used to get the data from the cache
///
/// # Returns
/// HttpResponse: The response that will be sent to the client, either a response 200 OK with the
/// scraped data or a Internal server error 500 with the error message.
#[get("/cache")]
pub async fn get_cached_materials(cache: Data<MongoRepo<Product>>, query:
Query<ScraperForm>) -> HttpResponse {
    //Form comes in format of {name: {}, store: {}}
    let name = query.name.clone().replace("+", " ").replace("_", " ");
    let doc = doc! {"name": &name, "company": &query.company};
    let returned_materials = match cache.
        get_documents_by_attribute(doc).await {
        Ok(materials) => materials,
        Err(_) => {
            //eprintln prints to stderr instead of out.
            eprintln!("No documents in the cache. Proceeding to scraping.");
            Vec::<Product>::new()
        }
    };
    if returned_materials.len() == 0 {
        return scrape_and_cache(cache, &name, &query.company).await;
    }
    //returns first material found on website. Primitive implementation will be fixed next semester
    let cloned_material = returned_materials[0].clone();
    let now = chrono::Utc::now().to_string();
    //let now = (chrono::Utc::now() + chrono::Duration::days(7)).to_string();
    let ttl = cloned_material.ttl;
    if now > ttl || now.eq(&ttl) {
        cache.delete_document(cloned_material.id.unwrap()).await.unwrap();
        return scrape_and_cache(cache, &name, &query.company).await;
    }
    return HttpResponse::Ok().json(returned_materials[0].clone());
}

/// A helper function that Scrapes the data and caches it to the database
///
/// # Parameters
/// cache: The cache that will be used to store the data
/// name: The name of the material that will be scraped
/// company: The company that will be scraped
///
/// # Returns
/// HttpResponse: The response that will be sent to the client, either a response 200 OK with the
/// scraped data or a Internal server error 500 with the error message.
async fn scrape_and_cache(cache: Data<MongoRepo<Product>>, name: &String, company: &String)
    -> HttpResponse{
    let material = match get_scraper_data(company,
                                          name).await{
        Ok(material) => material,
        Err(string) => {
            if string.eq("No Products Found") || string.eq("EOF while parsing a value at line 1 column 0"){
                return HttpResponse::NotFound().finish();
            }
            return HttpResponse::InternalServerError().body(string);
        }
    };
    let _ = cache.create_document(material.clone()).await.unwrap();
    return HttpResponse::Ok().json(material);
}

use std::process::{Command, Output, Stdio};
use mongodb::bson::doc;
use crate::model::scraper_model::{Product, ScraperLibrary};

/// A helper function that runs the python script and gets the data from the script
///
/// # Parameters
/// company: The company that will be scraped
/// material: The material that will be scraped
///
/// # Returns
/// Result<Product, String>: The result of the function, either a Product or a String
pub async fn get_scraper_data(company: &String, material: &String) -> Result<Product,
    String> {
    //runs the python script and gets the output
    let output: Output = Command::new("python3")
        .arg("./src/scraper/scraper.py")
        .arg(company)
        .arg(material)
        //instead of stdout. capture status of .exit() if there is a error. or otherwise capture std
        //out.
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
        company: company.clone(),
        ttl: (chrono::Utc::now() + chrono::Duration::days(7)).to_string(),
    })
}
