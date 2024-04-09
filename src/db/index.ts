import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import schema from "./schema";

const connection = new Database("./drizzle/db.sqlite");

const db = drizzle(connection, { schema });

// (async () => {
//   if (process.env.DEV) {
//     console.log();
//     console.log("DRIZZLE: ⚡ Running migrations");
//     await migrate(db, { migrationsFolder: "./drizzle" });
//     console.log("DRIZZLE: Done ✅");
//     console.log();
//   }
// })();

export default db;
