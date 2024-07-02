import { drizzle } from "drizzle-orm/better-sqlite3";
import schema from "./schema";
import Database from "better-sqlite3";

const sqlite = new Database("sqlite.db");

const db = drizzle(sqlite, { schema });

export default db;
