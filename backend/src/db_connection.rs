use std::borrow::Borrow;
use std::process::exit;
use mongodb::{Client, Collection, Cursor, Database, options::ClientOptions};
use mongodb::bson::{Document};
use mongodb::options::{FindOptions, InsertOneOptions};
use mongodb::results::InsertOneResult;

pub struct DbConnection {
    client: Client,
    database: Option<Database>,
    collection: Option<Collection<Document>>,
}

impl DbConnection {

    pub async fn new(database_address: String)
                     -> Self {
        DbConnection {
            client: connect_mongodb(database_address).await,
            database: None,
            collection: None,
        }
    }

    pub fn set_database(&mut self, database_name: &str) {
        let database: Database = self.client.database(database_name);
        self.database = Option::from(database);
    }

    pub fn set_collection(&mut self, collection_name: &str){
        let collection: Collection<Document> = self.database.as_ref().expect("Database hasnt\
         been initialized").collection(collection_name);
        self.collection = Option::from(collection);
    }

    pub async fn insert_document(&mut self, doc: impl Borrow<Document>, options: Option<InsertOneOptions>) -> InsertOneResult{
        self.collection.as_ref().expect("Collection never \
        initialized").insert_one(doc, options).await.expect("Could not add document, \
        check if mongoDB is running.")
    }

    pub async fn find_document(&mut self, filter: impl Into<Option<Document>>, options: Option<FindOptions>) -> Cursor<Document>{
         self.collection.as_ref().expect("Collection never initialized").find(filter, options).await.expect("Failed to find the document.")
    }

    pub async fn print_databases(&self) {
        let database_names = self.client.list_database_names(None, None).await;
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

    /*pub fn get_client(&self) -> &Client {
        &self.client
    }

    pub fn get_database(&self) -> &Database {
        return self.database.as_ref().expect("Database was never initialized");
    }

    pub fn get_collection(&self) -> &Collection<Document> {
        return self.collection.as_ref().expect("Database was never initialized");
    }*/
}

async fn connect_mongodb(database_address: String) -> Client {
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
    return client;
}