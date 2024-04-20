import { drizzle } from "drizzle-orm/postgres-js";
import schema from "./schema";
import postgres from "postgres";

const connection = postgres();

const db = drizzle(connection, { schema });

export default db;
