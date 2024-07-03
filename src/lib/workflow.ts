import path from "node:path";
import { DEPLOY_DIR_NAME, DEPLOY_FILE_NAME } from "~/constants";
import { exists } from "~/lib/shell";
import * as fs from "node:fs/promises";
import YAML from "yaml";
import fg from "fast-glob";
import { z } from "@builder.io/qwik-city";

import simpleGit from "simple-git";

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

    const files = await fs.readdir(projectsDir);

    const projectFiles = await Promise.all(
      files.map(async (pf) => {
        const validation = await validateWorkflow(pf, projectsDir);

        return { name: pf, valid: validation.ok };
      }),
    );

    const validFiles = projectFiles
      .filter((pf) => pf.valid)
      .map((pf) => pf.name);

    const projctWithRepo = await Promise.all(
      validFiles.map(async (pf) => {
        const projectPath = `${projectsDir}/${pf}`;

        const gitInfo = await getGitRemoteUrl(projectPath);

        return {
          name: pf,
          repo: gitInfo.repoName,
        };
      }),
    );

    return {
      ok: true,
      projects: projctWithRepo,
    };
  } catch (err) {
    return { ok: false };
  }
}

function extractRepoName(url: string) {
  const regex = /([^/]+)\.git$/;

  const match = url.match(regex);

  return match ? match[1] : null;
}

async function getGitRemoteUrl(projectPath: string) {
  const git = simpleGit(projectPath);

  try {
    const isRepo = await git.checkIsRepo();

    if (!isRepo) {
      return { url: null, repoName: null };
    }

    const remotes = await git.getRemotes(true);

    const origin = remotes.find((remote) => remote.name === "origin");

    const url = origin ? origin.refs.fetch : remotes[0].refs.fetch;

    const repoName = extractRepoName(url);

    return { url, repoName };
  } catch (err) {
    let message = "";

    if (err instanceof Error) {
      message = err.message;
    }

    console.error(`Error fetching remote URL for ${projectPath}:`, message);

    return { url: null, repoName: null };
  }
}

export async function getLastCommitInfo(projectPath: string) {
  const git = simpleGit(projectPath);

  try {
    const isRepo = await git.checkIsRepo();

    if (isRepo) {
      const log = await git.log({ maxCount: 1 });

      const lastCommit = log.latest
        ? {
            lastCommitHash: log.latest.hash,
            lastCommitMessage: log.latest.message,
            lastCommitTime: log.latest.date,
          }
        : null;

      return lastCommit;
    } else {
      return {
        lastCommitHash: null,
        lastCommitMessage: null,
        lastCommitTime: null,
      };
    }
  } catch (err) {
    let message = "";

    if (err instanceof Error) {
      message = err.message;
    }

    console.error(
      `Error fetching last commit info for ${projectPath}:`,
      message,
    );

    return {
      lastCommitHash: null,
      lastCommitMessage: null,
      lastCommitTime: null,
    };
  }
}
