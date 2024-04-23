import "dotenv/config";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import db, { connection } from ".";

await migrate(db, { migrationsFolder: "./drizzle" });

await connection.end();
