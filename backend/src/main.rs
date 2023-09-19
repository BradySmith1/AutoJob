use crate::db_connection::DbConnection;

mod db_connection;

#[tokio::main]
async fn main() {
    let mut db: DbConnection = DbConnection::new();
    db.connect_database("mongodb://localhost:27017".to_string()).await;
    db.print_databases().await;
}
