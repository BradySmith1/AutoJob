use std::process::{Command, Output, Stdio};
use crate::model::material_model::Material;
use crate::model::scraper_model::Library;

pub async fn get_scraper_data(company: &String, material: &String) -> Result<Material, String> {
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

    //converts the string to a Library object and returns the requests data.
    let result_json = match serde_json::from_str::<Library>(&data) {
        Ok(user) => user,
        Err(err) => return Err(err.to_string()),
    };

    //TODO might want to change this but should work right now.
    let product = result_json.available_products[0].clone();
    Ok(Material {
        id: None,
        name: product.name,
        price: product.price,
        quantity: 0.0,
        description: "material".to_string(),
    })
}