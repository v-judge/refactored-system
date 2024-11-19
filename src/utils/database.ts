import Database from '@tauri-apps/plugin-sql';

let db: Database | null = null;

export async function getDatabase() {
    if (!db) {
        db = await Database.load('sqlite:./database.db');
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