extern crate actix_web;
extern crate console;

//add the modules
mod api;
mod repository;
mod model;

use actix_web::{App, HttpServer, middleware::Logger};
use actix_web::web::Data;
use console::Style;
use api::user_estimate_api::{create_user, index, get_user, update_user, delete_user, get_all_users};
use repository::mongodb_repo::MongoRepoUser;


#[actix_web::main]
pub async fn main() -> std::io::Result<()> {
    std::env::set_var("RUST_LOG", "actix_web=info");
    std::env::set_var("RUST_BACKTRACE", "1");
    env_logger::init();

    let blue = Style::new()
        .blue();

    let prefix = "127.0.0.1:"; // // Use 0.0.0.0 instead of localhost or 127.0.0.1 to use Actix with docker
    let port = 3001; // We will use 80 for aws with env variable.
    let target = format!("{}{}", prefix, port);

    let db = MongoRepoUser::init().await;
    let db_data = Data::new(db);

    println!("\nServer ready at {}", blue.apply_to(format!("http://{}",&target)));

    HttpServer::new(move || {
        let logger = Logger::default();
        App::new()
            .wrap(logger)
            .app_data(db_data.clone())
            .service(create_user)
            .service(get_user)
            .service(update_user)
            .service(delete_user)
            .service(get_all_users)
            .service(index)
    })
        .bind(&target)?
        .run()
        .await
}


