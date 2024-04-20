import { pgTable, uuid, text, timestamp, boolean } from "drizzle-orm/pg-core";
// import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const project = pgTable("projects", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
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
  typeof project.$inferInsert,
  "id" | "createdAt"
>;

export type SelectProject = typeof project.$inferSelect;

export const key = pgTable("keys", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  projectId: uuid("project_id")
    .references(() => project.id)
    .notNull(),
  token: text("token").notNull(),
  createdAt: timestamp("created_at", {
    mode: "date",
    precision: 3,
  })
    .defaultNow()
    .notNull(),
});

export type InsertKey = Omit<typeof key.$inferInsert, "id" | "createdAt">;

export type SelectKey = typeof key.$inferSelect;

export default {
  key,
  project,
};
