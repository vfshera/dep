import { sql } from "drizzle-orm";
import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";
// import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const projects = sqliteTable("projects", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  name: text("name").unique().notNull(),
  slug: text("slug").unique().notNull(),
  workingDir: text("working_dir").notNull(),
  active: integer("active", { mode: "boolean" }).default(false),
  createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
});

export type InsertProject = Omit<
  typeof projects.$inferInsert,
  "id" | "createdAt"
>;

export type SelectProject = typeof projects.$inferSelect;

export default {
  projects,
};
