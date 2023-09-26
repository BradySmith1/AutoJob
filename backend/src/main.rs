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
use repository::mongodb_user_repo::MongoRepoUser;
use crate::api::job_estimate_api::{create_estimate, delete_estimate, get_all_estimates, get_estimate
                                   , update_estimate};
use crate::repository::mongodb_estimate_repo::MongoRepoEstimate;

/// This function initializes and runs an Actix API server.
/// It sets up the necessary environment variables, initializes the logger,
/// and configures the Actix web server with various services and routes.
///
/// # Returns
///
/// Returns a `std::io::Result` indicating the success or failure of running
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
    let db_user = MongoRepoUser::init().await;
    let db_estimate = MongoRepoEstimate::init().await;
    let db_user_data = Data::new(db_user);
    let db_estimate_data = Data::new(db_estimate);

    println!("\nServer ready at {}", blue.apply_to(format!("http://{}",&target)));

    // Creation of the api server
    HttpServer::new(move || {
        let logger = Logger::default();
        App::new()
            .wrap(logger)
            .app_data(db_user_data.clone())
            .app_data(db_estimate_data.clone())
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
            .service(index)
    })
        .bind(&target)?
        .run()
        .await
}


