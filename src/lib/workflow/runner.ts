import type { ScriptYield } from "~/types";
import {
  getLastCommitInfo,
  isRunnableJob,
  loadWorkflow,
  validateWorkflow,
} from ".";
import {
  DEPLOY_DIR_NAME,
  PUBLIC_ENV_PREFIX,
  REDACTED_ENV_VALUE,
} from "~/constants";
import path from "node:path";
import * as logUtils from "~/lib/logger/utils";
import sh from "../shell";
import {
  detectUndefinedVariables,
  loadEnv,
  redactEnvVariables,
} from "./context";
import type { DotenvParseOutput } from "dotenv";

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

    return;
  }

  const PROJECT_WD = path.join(BASE_DIR, dir, DEPLOY_DIR_NAME);

  const results = await loadWorkflow(PROJECT_WD);

  if (!results.ok) {
    yield {
      type: "ERROR",
      value: results.error,
    };

    return;
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

  const env = await loadEnv(PROJECT_WD);

  for (const key in actions.jobs) {
    const job = actions.jobs[key as keyof (typeof actions)["jobs"]];

    yield logUtils.info(job.name);

    if (isRunnableJob(job)) {
      yield* runCommand({
        command: job.run,
        cwd: PROJECT_WD,
        depEnv: env || undefined,
      });
    } else {
      for (const step of job.steps) {
        yield logUtils.info(step.name);
        yield* runCommand({
          command: step.run,
          cwd: PROJECT_WD,
          depEnv: env || undefined,
        });
      }
    }
  }

  yield logUtils.end();
}

type RunCommandOptions = {
  command: string;
  cwd: string;
  depEnv?: DotenvParseOutput;
};

async function* runCommand({
  command,
  cwd,
  depEnv,
}: RunCommandOptions): AsyncGenerator<ScriptYield, void, unknown> {
  const [com, ...cmds] = command.split(" ");

  if (depEnv) {
    const envList = Object.keys(depEnv).reduce((acc, key) => {
      acc.push(
        `${key}=${key.startsWith(PUBLIC_ENV_PREFIX) ? depEnv[key] : REDACTED_ENV_VALUE}`,
      );

      return acc;
    }, [] as string[]);

    yield logUtils.info("ENV " + envList.join("; "));
  }

  for (const cmd of command.split("\n")) {
    const undefinedVariables = detectUndefinedVariables(cmd, depEnv || {});

    if (undefinedVariables) {
      const message = `Command \`${cmd}\` contains undefined variable(s): ${undefinedVariables.map((v) => `"$${v}"`).join(", ")}.`;

      yield logUtils.error(message);

      return;
    }
  }

  const childProcess = sh.spawn(com, cmds, {
    cwd,
    shell: true,
    env: { ...process.env, ...(depEnv || {}) },
  });

  for await (const data of childProcess.stdout) {
    yield logUtils.data(
      redactEnvVariables(data.toString().trim(), depEnv || {}),
    );
  }

  for await (const data of childProcess.stderr) {
    yield logUtils.error(
      redactEnvVariables(data.toString().trim(), depEnv || {}),
    );
  }

  const exitCode = await new Promise<number | null>((resolve) => {
    childProcess.on("exit", (code) => resolve(code));
  });

  if (exitCode !== 0) {
    yield logUtils.error(
      `Command "${command}" failed with exit code ${exitCode}.`,
    );
  }
}
