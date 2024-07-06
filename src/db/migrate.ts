import "dotenv/config";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { drizzle } from "drizzle-orm/postgres-js";

import postgres from "postgres";
import schema from "./schema";

const client = postgres({
  database: process.env.DB_NAME as string,
  host: process.env.DB_HOST as string,
  user: process.env.DB_USER as string,
  password: process.env.DB_PASS as string,
  max: 1,
});

await migrate(drizzle(client, { schema }), {
  migrationsFolder: "./drizzle",
});

await client.end();
