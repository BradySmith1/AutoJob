use std::process::exit;
use mongodb::{Client, options::ClientOptions};

async fn connect_database(database_address: &String) -> Client {
    let client_options = ClientOptions::parse(database_address).await;
    let mut client_options = match client_options {
        Ok(client_options) => client_options,
        Err(_) => {
            println!("Error: Could not parse address. Check the address rust is trying to connect to.");
            exit(1);
        }
    };

    client_options.app_name = Some("Job Estimator and Scheduler".to_string());

    let client = Client::with_options(client_options);
    let client = match client {
        Ok(client) => client,
        Err(_) => {
            println!("Error: Could not connect to the database. Check if mongoDB is running.");
            exit(1);
        }
    };
    return client
}

async fn print_databases(client: &Client) {
    let database_names = client.list_database_names(None, None).await;
    let database_names = match database_names {
        Ok(database_names) => database_names,
        Err(_) => {
            println!("Error: No databases.");
            exit(1);
        }
    };
    for db_name in database_names {
        println!("{}", db_name);
    }
}

#[tokio::main]
async fn main() {
    let database_address = "mongodb://localhost:27017".to_string();
    let client = connect_database(&database_address).await;
    let _ = print_databases(&client).await;
}
