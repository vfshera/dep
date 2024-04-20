import { pgTable, uuid, text, timestamp, boolean } from "drizzle-orm/pg-core";
// import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

export const projects = pgTable("projects", {
  id: uuid("id").primaryKey(),
  name: text("name").notNull(),
  active: boolean("active").default(false).notNull(),
  createdAt: timestamp("created_at", { mode: "date", precision: 3 })
    .defaultNow()
    .notNull(),
});

export const keys = pgTable("keys", {
  id: uuid("id").primaryKey(),
  name: text("name").notNull(),
  projectId: uuid("project_id").notNull(),
  token: text("token").notNull(),
  createdAt: timestamp("created_at", { mode: "date", precision: 3 })
    .defaultNow()
    .notNull(),
});

export default {
  projects,
};
