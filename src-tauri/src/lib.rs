use tauri_plugin_sql::{Migration, MigrationKind};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let migrations = vec![
        Migration {
          version: 1,
          description: "create initial tables",
          sql: r#"
            CREATE TABLE IF NOT EXISTS products (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              name TEXT UNIQUE NOT NULL
            );


            CREATE TABLE IF NOT EXISTS customers (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              name TEXT NOT NULL
            );



            CREATE TABLE IF NOT EXISTS orders (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              customer_id INTEGER,
              product_id INTEGER,
              quantity INTEGER,
              order_date TEXT,
              completion_date TEXT,
              status TEXT,
              notes TEXT,
              FOREIGN KEY (customer_id) REFERENCES customers(id),
              FOREIGN KEY (product_id) REFERENCES products(id)
            );
            
          "#,
          kind: MigrationKind::Up,
        },
      ];

    tauri::Builder::default()
        .plugin(tauri_plugin_sql::Builder::default()
        .add_migrations("sqlite:database.db", migrations)
        .build())
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

// INSERT OR IGNORE INTO CUSTOMERS (name) VALUES
// ('Мэрия Москвы'),
// ('Сколково');

// INSERT INTO products (name) VALUES
// ('Сырые пиломатериалы'),
// ('Сухие пиломатериалы'),
// ('Строганные доски'),
// ('Рейки'),
// ('Брус'),
// ('Пеллеты');