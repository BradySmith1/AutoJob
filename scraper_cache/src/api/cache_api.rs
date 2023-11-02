use actix_web::{web::{Data}, HttpResponse, get};
use actix_web::web::Form;
use model::material_model::Material;
use crate::api::scraper_api::get_scraper_data;
use crate::model;
use crate::model::form_data_model::GetForm;
use crate::repository::mongodb_repo::MongoRepo;

#[get("/cache")]
pub async fn get_cached_materials(cache: Data<MongoRepo<Material>>, Form(form): Form<GetForm>) ->
                                                                                     HttpResponse {
    let material: String = "name_".to_string() + &form.material;
    let returned_materials = match cache.
        get_documents_by_attribute(&material).await {
        Ok(materials) => materials,
        Err(_) => {
            println!("Error: Could not get materials from the cache.");
            return HttpResponse::InternalServerError().finish();
        }
    };
    if returned_materials.len() == 0 {
        let material = match get_scraper_data(&form.company, &form.material).await{
            Ok(material) => material,
            Err(string) => {
                if string.eq("No Products Found"){
                    return HttpResponse::NotFound().finish();
                }
                println!("Error: Could not get materials from the scraper.");
                return HttpResponse::InternalServerError().finish();
            }
        };
        let material = cache.create_document(material.clone()).await.unwrap();
        HttpResponse::Ok().json(material)
    }else{
        HttpResponse::Ok().json(returned_materials[0].clone())
    }
}