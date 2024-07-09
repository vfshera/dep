import { desc, eq, or } from "drizzle-orm";
import { db } from ".";
import type { InsertProject } from "./schema";
import { projects } from "./schema";

export async function createProject(data: InsertProject) {
  return db
    .insert(projects)
    .values(data)
    .returning({ id: projects.id, slug: projects.slug });
}

export async function getProjectById(id: string) {
  return db.query.projects.findFirst({
    where: (proj) => eq(proj.id, Number(id)),
  });
}

export async function getProjectBySlug(slug: string) {
  return db.query.projects.findFirst({
    where: (proj) => eq(proj.slug, slug),
  });
}

export async function updateProjectName(slug: string, name: string) {
  return await db
    .update(projects)
    .set({ name })
    .where(eq(projects.slug, slug))
    .returning({ updatedName: projects.name });
}

export async function checkIfProjectExists(slug: string, dir: string) {
  return db.query.projects.findFirst({
    where: (proj) => or(eq(proj.slug, slug), eq(proj.workingDir, dir)),
  });
}

export async function getProjects() {
  return db.query.projects.findMany({ orderBy: desc(projects.createdAt) });
}
