mod repository;
mod api;
mod model;
mod utils;

use std::path::Path;
use actix_web::{App, HttpServer, middleware::Logger};
use actix_web::web::Data;
use console::Style;
use openssl::ssl::{SslAcceptor, SslAcceptorBuilder, SslFiletype, SslMethod};
use repository::mongodb_repo::MongoRepo;
use crate::api::authenticate_api::authenticate_user;
use crate::api::enroll_api::enroll_user;
use crate::model::refresh_model::RefreshToken;
use crate::model::user_model::User;

/// This function creates a SslAcceptorBuilder that is used to create a SslAcceptor.
fn ssl_builder() -> SslAcceptorBuilder {
    let private_key_path = Path::new("./src/ssl/private_key.key");
    let ssl_cert_path = Path::new("./src/ssl/ssl_certificate.cer");
    let ssl_cert_int_path = Path::new("./src/ssl/ssl_certificate_INTERMEDIATE.cer");
    let mut builder = SslAcceptor::mozilla_intermediate(SslMethod::tls()).unwrap();
    builder
        .set_private_key_file(private_key_path, SslFiletype::PEM)
        .expect("failed to open/read key.pem");
    builder
        .set_certificate_file(ssl_cert_path, SslFiletype::PEM)
        .expect("failed to open/read cert.pem");
    builder
        .set_ca_file(ssl_cert_int_path)
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
    std::env::set_var("TOKEN_URL", "https://localhost:3000/token");
    std::env::set_var("SYSTOKEN", "sZfYyXXTuv-Umlk9JA9IJ-7LynBO3MUs-wNe1idUbop-EMWIK5l5N8");
    std::env::set_var("TOKENEXP", "1");
    env_logger::init();

    // Format the hypertext link to the localhost.
    let blue = Style::new()
        .blue();
    let prefix = "0.0.0.0:";
    let port = 5000;
    let target = format!("{}{}", prefix, port);

    //checks if MongoDB instance is running
    //check_mongodb();

    // Initializes the different Mongodb collection connections.
    let db_user_cache: MongoRepo<User> = MongoRepo::init("users").await;
    let db_refresh_cache: MongoRepo<RefreshToken> = MongoRepo::init("refreshTokens").await;
    let db_user_cache_data = Data::new(db_user_cache);
    let db_refresh_cache_data = Data::new(db_refresh_cache);

    // Creates the ssl builder to use with the HTTP server
    //let ssl = ssl_builder();

    println!("\nServer ready at {}", blue.apply_to(format!("https://{}",&target)));

    // Creation of the api server
    HttpServer::new(move || {
        let logger = Logger::default();
        App::new()
            .wrap(logger)
            .app_data(db_user_cache_data.clone())
            .app_data(db_refresh_cache_data.clone())
            .app_data(Data::<String>::new("secret".to_owned()))
            .service(enroll_user)
            .service(authenticate_user)

    })
        .bind(&target)?
        .run()
        .await
}