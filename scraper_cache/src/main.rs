mod repository;
mod model;
mod api;

use std::io::{Read};
use std::process::{Command, Stdio};
use actix_web::{App, HttpServer, middleware::Logger};
use actix_web::web::Data;
use console::Style;
use openssl::ssl::{SslAcceptor, SslAcceptorBuilder, SslFiletype, SslMethod};
use repository::mongodb_repo::MongoRepo;
use crate::api::cache_api::get_cached_materials;
use crate::model::scraper_model::{Product};

/// This function checks if MongoDB is running on the local machine.
fn check_mongodb() {
    let output = Command::new("./src/repository/check_mongodb_running.sh")
        .stdout(Stdio::piped())
        .output()
        .expect("Could not run bash command");
    let data = String::from_utf8(output.stdout.clone()).unwrap();
    if data.eq("MongoDB is not running\n") {
        println!("MongoDB is not running. Attempting to start on local machine");
        let mut start = Command::new("sudo")
            .arg("./src/repository/start_mongodb.sh")
            .stdout(Stdio::piped())
            .stdin(Stdio::piped())
            .spawn()
            .unwrap();
        let mut output = String::new();
        start.stdout.as_mut().unwrap().read_to_string(&mut output).expect("Failed to read stdout");
        println!("{}", output);
    }
}

fn check_script_dependencies() {
    Command::new("./src/scraper/check_script_dependencies.sh")
        .status()
        .expect("Could not run bash command");
    println!("Dependencies are installed");
}

/// This function creates a SslAcceptorBuilder that is used to create a SslAcceptor.
fn ssl_builder() -> SslAcceptorBuilder {
    let mut builder = SslAcceptor::mozilla_intermediate(SslMethod::tls()).unwrap();
    builder
        .set_private_key_file("./src/ssl/key.pem", SslFiletype::PEM)
        .expect("failed to open/read key.pem");
    builder.set_certificate_chain_file("./src/ssl/cert.pem")
        .expect("failed to open/read cert.pem");
    builder
}

/// This function initializes and runs an Actix API server.
/// It sets up the necessary environment variables, initializes the logger,
/// and configures the Actix web server with various services and routes.
///
/// # Returns
///
/// Returns a Result indicating the success or failure of running
/// the Actix web server.
#[actix_web::main]
pub async fn main() -> std::io::Result<()> {
    // Setup environment variables.
    std::env::set_var("RUST_LOG", "actix_web=info");
    std::env::set_var("RUST_BACKTRACE", "1");
    std::env::set_var("MONGOURL", "mongodb://localhost:27017");
    env_logger::init();

    // Format the hypertext link to the localhost.
    let blue = Style::new()
        .blue();
    let prefix = "127.0.0.1:";
    let port = 5000;
    let target = format!("{}{}", prefix, port);

    //checks if MongoDB instance is running
    //check_mongodb();

    //checks if the script dependencies are installed
    check_script_dependencies();

    // Initializes the different Mongodb collection connections.
    let db_cache: MongoRepo<Product> = MongoRepo::init("materialCache").await;
    let db_cache_data = Data::new(db_cache);

    // Creates the ssl builder to use with the HTTP server
    let ssl = ssl_builder();

    println!("\nServer ready at {}", blue.apply_to(format!("https://{}",&target)));

    // Creation of the api server
    HttpServer::new(move || {
        let logger = Logger::default();
        App::new()
            .wrap(logger)
            .app_data(db_cache_data.clone())
            .service(get_cached_materials)

    })
        .bind(&target)?
        .run()
        .await
}
