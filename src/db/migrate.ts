import "dotenv/config";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { connection, db } from ".";
import env from "~/env";
import config from "$/drizzle.config";

if (!env.DB_MIGRATING) {
  throw new Error(
    'You must set DB_MIGRATING to "true" when running migrations',
  );
}

await migrate(db, {
  migrationsFolder: config.out || "./drizzle",
});

await connection.end();
