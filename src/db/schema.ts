import { pgTable, serial, text, timestamp, boolean } from "drizzle-orm/pg-core";
// import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: text("name").unique().notNull(),
  slug: text("slug").unique().notNull(),
  workingDir: text("working_dir").notNull(),
  active: boolean("active").default(false),
  createdAt: timestamp("created_at", {
    mode: "date",
    precision: 3,
  })
    .defaultNow()
    .notNull(),
});

export type InsertProject = Omit<
  typeof projects.$inferInsert,
  "id" | "createdAt"
>;

export type SelectProject = typeof projects.$inferSelect;

export default {
  projects,
};
