extern crate actix_web;
extern crate console;

// uses the module api.
mod api;
// uses the module repository.
mod repository;
// uses the module model.
mod model;
mod utils;

use std::io::{Read};
use clokwerk::{AsyncScheduler, TimeUnits};
use std::time::Duration;
use std::process::{Command, Stdio};
use actix_web::{App, HttpServer, middleware::Logger};
use actix_web::web::Data;
use console::Style;
use api::user_estimate_api::{create_user, index, get_user, update_user, delete_user,
                             get_all_users, get_image};
use repository::mongodb_repo::MongoRepo;
use openssl::ssl::{SslAcceptor, SslAcceptorBuilder, SslFiletype, SslMethod};
use crate::api::job_estimate_api::{create_estimate, delete_estimate, get_all_estimates,
                                   get_estimate, update_estimate};
use crate::api::jwt_api::store_token;
use crate::api::library_api::{check_libraries, create_library_entry, delete_library_entry, get_all_library_entries, get_library_entry, update_library_entry};
use crate::api::scraper_api::manual_web_scrape;

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

/// This function creates an SSL builder for the Actix web server.
///
/// # Returns
/// Returns an SslAcceptorBuilder for the Actix web server.
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
    std::env::set_var("IMAGE_PATH", "../images/");
    std::env::set_var("WEB_CACHE_URL", "https://localhost:5000/cache");
    std::env::set_var("AUTHSERVERTOKEN","sZfYyXXTuv-Umlk9JA9IJ-7LynBO3MUs-wNe1idUbop-EMWIK5l5N8");
    env_logger::init();

    // Format the hypertext link to the localhost.
    let blue = Style::new()
        .blue();
    let prefix = "127.0.0.1:";
    let port = 3001;
    let target = format!("{}{}", prefix, port);

    //checks if MongoDB instance is running
    check_mongodb();

    // Creates the SSL builder for the Actix web server.
    //let ssl = ssl_builder();

    // Creates the scheduler for the Actix web server that runs the web scraper at a certain
    // interval.
    //DECIDED NOT TO USE FOR RIGHT NOW BECAUSE IT WILL BE HORRIBLY INEFFICIENT
    // let time_interval: u32 = 5;
    // let mut scheduler = AsyncScheduler::new();
    // scheduler
    //     .every(time_interval.minutes())
    //     .run(|| async { check_libraries().await; });
    // tokio::spawn(async move {
    //     loop {
    //         scheduler.run_pending().await;
    //         tokio::time::sleep(Duration::from_millis(100)).await;
    //     }
    // });


    println!("\nServer ready at {}", blue.apply_to(format!("https://{}",&target)));

    // Creation of the api server
    HttpServer::new(move || {
        let logger = Logger::default();
        App::new()
            .wrap(logger)
            //.wrap(Protected)
            .app_data(Data::<String>::new("secret".to_owned()))
            .service(create_user)
            .service(get_user)
            .service(get_image)
            .service(update_user)
            .service(delete_user)
            .service(get_all_users)
            .service(create_estimate)
            .service(get_estimate)
            .service(update_estimate)
            .service(delete_estimate)
            .service(get_all_estimates)
            .service(create_library_entry)
            .service(get_library_entry)
            .service(update_library_entry)
            .service(delete_library_entry)
            .service(get_all_library_entries)
            .service(manual_web_scrape)
            .service(store_token)
            .service(index)

    })
        .bind(&target)?
        .run()
        .await
}


