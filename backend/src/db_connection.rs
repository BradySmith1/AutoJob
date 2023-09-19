use std::process::exit;
use mongodb::{Client, options::ClientOptions};

pub struct DbConnection {
    client: Option<Client>,
}

impl DbConnection {

    pub fn new()
                     -> Self {
        DbConnection {
            client: None,
        }
    }

    pub async fn connect_database(&mut self, database_address: String) {
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
        self.client = Option::from(client);
    }

    pub async fn print_databases(&self) {
        let database_names = self.client.as_ref().expect("Client was never initialized.").list_database_names(None, None).await;
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

    pub fn get_client(&self) -> &Option<Client> {
        &self.client
    }
}