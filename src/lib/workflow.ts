import path from "node:path";
import { DEPLOY_DIR_NAME, DEPLOY_FILE_NAME } from "~/constants";
import { exists } from "~/lib/shell";
import * as fs from "node:fs/promises";
import YAML from "yaml";
import fg from "fast-glob";
import { z } from "@builder.io/qwik-city";

const runJobSchema = z.object({
  name: z.string(),
  run: z.string(),
});

export const workflowSchema = z.object({
  name: z.string(),
  jobs: z.record(
    z.string(),
    z.union([
      runJobSchema,
      z.object({
        name: z.string(),
        steps: z.array(runJobSchema),
      }),
    ]),
  ),
});

export type RunnableJob = z.infer<typeof runJobSchema>;

export type Workflow = z.infer<typeof workflowSchema>;

export function isRunnableJob(obj: any): obj is RunnableJob {
  return "run" in obj;
}

export async function validateWorkflow(targetDir: string, baseDir: string) {
  const projectPath = path.join(baseDir, targetDir);

  /**
   * Check if project exists
   */
  let res = await exists(targetDir, baseDir);

  if (!res.ok) {
    return {
      ok: false,
      message: `Project '${targetDir}' does not exist!`,
    };
  }

  /***
   * Check if deploy directory exists
   */
  res = await exists(DEPLOY_DIR_NAME, projectPath);

  if (!res.ok) {
    return {
      ok: false,
      message: `'${DEPLOY_DIR_NAME}' directory is not found in '${targetDir}'!`,
    };
  }

  /**
   * Check if deploy file exists
   */
  res = await exists(DEPLOY_FILE_NAME, path.join(projectPath, DEPLOY_DIR_NAME));

  if (!res.ok) {
    return {
      ok: false,
      message: `'${DEPLOY_FILE_NAME.join(" or ")}' script is not found in '${targetDir}'!`,
    };
  }

  /***
   * Try loading the file if error  it means the file is not valid
   */

  res = await loadWorkflow(path.join(projectPath, DEPLOY_DIR_NAME));

  if (!res.ok) {
    return { ok: false, message: res.error };
  }

  return { ok: true, message: "" };
}

/**
 *Loads the deploy(.yml or .yaml) workflow file
 * @param workingDir path to .dep directory *
 */
export async function loadWorkflow(
  workingDir: string,
): Promise<{ ok: true; actions: Workflow } | { ok: false; error: string }> {
  const [entry] = await fg(DEPLOY_FILE_NAME, {
    onlyFiles: true,
    cwd: workingDir,
  });

  const file = await fs.readFile(path.join(workingDir, entry), "utf-8");

  const results = workflowSchema.safeParse(YAML.parse(file));

  if (!results.success) {
    return {
      error: "Invalid workflow file!",
      ok: false,
    };
  }

  return { actions: results.data, ok: true };
}

export async function listProjects(projectsDir: string) {
  try {
    await fs.access(projectsDir, fs.constants.R_OK);

    const projectFiles = await fs.readdir(projectsDir);

    const validFiles = await Promise.all(
      projectFiles.map(async (pf) => {
        const validation = await validateWorkflow(pf, projectsDir);

        return { name: pf, valid: validation.ok };
      }),
    );

    return {
      ok: true,
      projects: validFiles.filter((pf) => pf.valid).map((pf) => pf.name),
    };
  } catch (err) {
    return { ok: false };
  }
}
