extern crate actix_web;
extern crate console;

// uses the module api.
mod api;
// uses the module repository.
mod repository;
// uses the module model.
mod model;

use actix_web::{App, HttpServer, middleware::Logger};
use actix_web::web::Data;
use console::Style;
use api::user_estimate_api::{create_user, index, get_user, update_user, delete_user, get_all_users};
use repository::mongodb_repo::MongoRepo;
use crate::api::job_estimate_api::{create_estimate, delete_estimate, get_all_estimates, get_estimate
                                   , update_estimate};
use crate::api::library_api::{create_library_entry, delete_library_entry, get_all_library_entries, get_library_entry, update_library_entry};
use crate::api::scraper_api::get_scraper_data;
use crate::model::estimate_model::JobEstimate;
use crate::model::library_model::MaterialFee;
use crate::model::user_model::UserEstimate;

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
    env_logger::init();

    // Format the hypertext link to the localhost.
    let blue = Style::new()
        .blue();
    let prefix = "127.0.0.1:"; // // Use 0.0.0.0 instead of localhost or 127.0.0.1 to use Actix with docker
    let port = 3001; // We will use 80 for aws with env variable.
    let target = format!("{}{}", prefix, port);

    // Initializes the different Mongodb collection connections.
    let db_user: MongoRepo<UserEstimate> = MongoRepo::init("userEstimates").await;
    let db_estimate: MongoRepo<JobEstimate> = MongoRepo::init("jobEstimates").await;
    let db_library: MongoRepo<MaterialFee> = MongoRepo::init("materialLibrary").await;
    let db_user_data = Data::new(db_user);
    let db_estimate_data = Data::new(db_estimate);
    let db_library_data = Data::new(db_library);

    println!("\nServer ready at {}", blue.apply_to(format!("http://{}",&target)));

    // Creation of the api server
    HttpServer::new(move || {
        let logger = Logger::default();
        App::new()
            .wrap(logger)
            .app_data(db_user_data.clone())
            .app_data(db_estimate_data.clone())
            .app_data(db_library_data.clone())
            .service(create_user)
            .service(get_user)
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
            .service(get_scraper_data)
            .service(index)

    })
        .bind(&target)?
        .run()
        .await
}


