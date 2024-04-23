import path from "node:path";
import { DEPLOY_DIR_NAME, DEPLOY_FILE_NAME } from "~/constants";
import { exists } from "~/lib/shell";
import * as fs from "node:fs";
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
  let res = await exists(targetDir, baseDir);

  if (!res.ok) {
    return {
      ok: false,
      message: `Project '${targetDir}' does not exist!`,
    };
  }

  res = await exists(DEPLOY_DIR_NAME, path.join(baseDir, targetDir));

  if (!res.ok) {
    return {
      ok: false,
      message: `'${DEPLOY_DIR_NAME}' directory is not found in '${targetDir}'!`,
    };
  }

  res = await exists(
    DEPLOY_FILE_NAME,
    path.join(baseDir, targetDir, DEPLOY_DIR_NAME),
  );

  if (!res.ok) {
    return {
      ok: false,
      message: `'${DEPLOY_FILE_NAME.join(" or ")}' script is not found in '${targetDir}'!`,
    };
  }

  return { ok: true , message: "" };
}

export async function loadWorkflow(workingDir: string) {
  const [entry] = await fg(DEPLOY_FILE_NAME, {
    onlyFiles: true,
    cwd: workingDir,
  });

  const file = fs.readFileSync(path.join(workingDir, entry), "utf-8");

  const actions = workflowSchema.parse(YAML.parse(file));

  return actions;
}
