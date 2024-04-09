import type { Config } from "drizzle-kit";
export default {
  schema: "./src/db/schema.ts",
  out: "./drizzle/migrations/",
  driver: "better-sqlite",
  dbCredentials: {
    url: "./drizzle/db.sqlite",
  },
} satisfies Config;
