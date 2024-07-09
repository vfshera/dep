import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";
import postgres from "postgres";
import env from "~/env";

export const connection = postgres({
  database: env.DB_NAME,
  host: env.DB_HOST,
  user: env.DB_USER,
  password: env.DB_PASS,
  max: env.DB_MIGRATING ? 1 : undefined,
});

export const db = drizzle(connection, { schema });
