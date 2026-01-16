import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

let db: ReturnType<typeof drizzle>;

/**
 * Sets up the database connection. Don't double initialize when a worker is hot
 * and has already been initialized.
 * @param bindingDb
 * @returns
 */
export function initDatabase(bindingDb: D1Database) {
  if (db) return;
  db = drizzle(bindingDb, { schema });
}

export function getDb() {
  if (!db) {
    throw new Error("Database not initialized");
  }
  return db;
}

// Re-export schema for convenience
export * from "./schema";
