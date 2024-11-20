import Database from '@tauri-apps/plugin-sql';

let db: Database | null = null;

export async function getDatabase() {
    if (!db) {
        db = await Database.load('sqlite:./database.db');
        await initializeDatabase();
    }
    return db;
}

export async function executeQuery(query: string, params: any[] = []) {
    const db = await getDatabase();
    return await db.execute(query, params);
}

export async function selectQuery(query: string, params: any[] = []) {
    const db = await getDatabase();
    return await db.select(query, params);
}

async function initializeDatabase() {
    // Pre-add products
    const products = [
        {name: 'Сырые пиломатериалы'},
        {name: 'Сухие пиломатериалы'},
        {name: 'Строганные доски'},
        {name: 'Рейки'},
        {name: 'Брус'},
        {name: 'Пеллеты'},
    ];

    for (const product of products) {
        await executeQuery(
            'INSERT OR IGNORE INTO products (name) VALUES ($1)',
            [product.name]
        );
    }
}