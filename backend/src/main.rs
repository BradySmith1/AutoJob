use crate::db_connection::DbConnection;

mod db_connection;

#[tokio::main]
async fn main() {
    let mut db_conn: DbConnection = DbConnection::new("mongodb://localhost:27017".to_string()).await;
    db_conn.set_database("ajseDB");
    db_conn.set_collection("estimates");
    db_conn.print_databases().await;
}
