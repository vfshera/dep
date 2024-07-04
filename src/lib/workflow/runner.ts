import type { ScriptYield } from "~/types";
import {
  getLastCommitInfo,
  isRunnableJob,
  loadWorkflow,
  validateWorkflow,
} from ".";
import { DEPLOY_DIR_NAME } from "~/constants";
import path from "node:path";
import * as logUtils from "~/lib/logger/utils";
import sh from "../shell";

export async function* runner(
  dir: string,
  BASE_DIR: string,
): AsyncGenerator<ScriptYield, void, unknown> {
  const validation = await validateWorkflow(dir, BASE_DIR);

  if (!validation.ok) {
    yield {
      type: "ERROR",
      value: validation.message!,
    };

    throw Error(validation.message);
  }

  const PROJECT_WD = path.join(BASE_DIR, dir, DEPLOY_DIR_NAME);

  const results = await loadWorkflow(PROJECT_WD);

  if (!results.ok) {
    yield {
      type: "ERROR",
      value: results.error,
    };

    throw Error(results.error);
  }

  const commit = await getLastCommitInfo(path.join(BASE_DIR, dir));

  yield logUtils.gitInfo(
    JSON.stringify({
      hash: commit?.lastCommitHash ?? "",
      message: commit?.lastCommitMessage ?? "",
      time: commit?.lastCommitTime ?? "",
    }),
  );

  const { actions } = results;

  yield logUtils.start(actions.name);

  /**
   * TODO:
   *
   *  check if .env.dep exists
   *  load the .env.dep
   */

  for (const key in actions.jobs) {
    const job = actions.jobs[key as keyof (typeof actions)["jobs"]];

    yield logUtils.info(job.name);

    if (isRunnableJob(job)) {
      yield* runCommand(job.run, PROJECT_WD);
    } else {
      for (const step of job.steps) {
        yield logUtils.info(step.name);
        yield* runCommand(step.run, PROJECT_WD);
      }
    }
  }

  yield logUtils.end();
}

async function* runCommand(
  command: string,
  cwd: string,
): AsyncGenerator<ScriptYield, void, unknown> {
  const [com, ...cmds] = command.split(" ");

  const process = sh.spawn(com, cmds, { cwd, shell: true });

  for await (const data of process.stdout) {
    yield logUtils.data(data.toString().trim());
  }

  for await (const data of process.stderr) {
    yield logUtils.error(data.toString().trim());
  }

  const exitCode = await new Promise<number | null>((resolve) => {
    process.on("exit", (code) => resolve(code));
  });

  if (exitCode !== 0) {
    yield logUtils.error(
      `Command "${command}" failed with exit code ${exitCode}.`,
    );
  }
}
