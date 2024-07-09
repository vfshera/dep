import { defineConfig } from "drizzle-kit";
import env from "~/env";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle/",
  dialect: "postgresql",
  dbCredentials: {
    database: env.DB_NAME,
    host: env.DB_HOST,
    user: env.DB_USER,
    password: env.DB_PASS,
    port: 5432,
  },
  verbose: true,
  strict: true,
});
