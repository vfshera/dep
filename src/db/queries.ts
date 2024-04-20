import db from ".";
import type { InsertProject } from "./schema";
import { project } from "./schema";

export async function createProject(data: InsertProject) {
  return db.insert(project).values(data).returning({ id: project.id });
}

export async function getProjectById(id: string) {
  return db.query.project.findFirst({
    where: (users, { eq }) => eq(users.id, id),
  });
}

export async function getProjects() {
  return db.query.project.findMany();
}
