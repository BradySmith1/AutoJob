extern crate actix_web;
extern crate actix_files;
extern crate console;

use actix_files as fs;
use actix_web::{App, HttpServer, web, middleware, Result, Responder, HttpResponse};

use std::path::PathBuf;

use console::Style;
use mongodb::bson::{doc};
use crate::db_connection::DbConnection;

mod db_connection;

async fn single_page_app() -> Result<fs::NamedFile> {
    let path: PathBuf = PathBuf::from("../frontend/build/index.html");
    Ok(fs::NamedFile::open(path)?)
}

#[actix_web::main]
pub async fn main() -> std::io::Result<()> {
    std::env::set_var("RUST_LOG", "actix_web=info");
    env_logger::init();

    let blue = Style::new()
        .blue();

    // 2.
    let prefix = "127.0.0.1:"; // // Use 0.0.0.0 instead of localhost or 127.0.0.1 to use Actix with docker
    let port = 8080; // We will use 80 for aws with env variable.
    let target = format!("{}{}", prefix, port);

    let mut db_conn: DbConnection = DbConnection::new("mongodb://localhost:27017".to_string()).await;
    db_conn.set_database("ajseDB");
    db_conn.set_collection("estimates");

    println!("\nServer ready at {}", blue.apply_to(format!("http://{}",&target)));

    HttpServer::new(|| {
        App::new()
            .wrap(middleware::Logger::default())
            .route("/", web::get().to(single_page_app))
            .route("/user", web::get().to(single_page_app))
            .service(fs::Files::new("/", "../frontend/build").index_file("index.html"))
    })
        .bind(&target) // Separate prefix, port, target, println! not to show "Not registered service error"
        .unwrap()
        .run()
        .await
}

