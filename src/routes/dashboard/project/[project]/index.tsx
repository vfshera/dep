import { $, component$, useComputed$, useSignal } from "@builder.io/qwik";
import { toast } from "qwik-sonner";

import type { ScriptYield } from "~/types";
import type { prettyLogs } from "~/utils";
import { cn } from "~/utils";
import {
  type DocumentHead,
  routeLoader$,
  server$,
} from "@builder.io/qwik-city";

import { scriptLogger } from "~/lib/logger";
import * as u from "~/lib/logger/utils";
import { getProjectBySlug } from "~/db/queries";
import { DEPLOY_DIR_NAME, WORKING_DIR_KEY } from "~/constants";
import { isRunnableJob, loadWorkflow, validateWorkflow } from "~/lib/workflow";
import path from "node:path";
import sh from "~/lib/shell";

export const useProject = routeLoader$(async ({ params, status }) => {
  const project = await getProjectBySlug(params.project);

  if (!project) {
    status(404);
  }

  return project;
});

export const useLogs = routeLoader$(
  async ({ resolveValue }): Promise<ReturnType<typeof prettyLogs>> => {
    const p = await resolveValue(useProject);

    if (!p) return [];

    return u.getLogs(p.slug);
  },
);

export const logDeployment = server$(function (
  id: string,
  logs: ScriptYield[],
) {
  const logger = scriptLogger({
    id: id,
  });

  logs.forEach((i) => {
    switch (i.type) {
      case "INFO":
        logger.info(i.value);
        break;
      case "DATA":
        logger.data(i.value);
        break;
      case "ERROR":
        logger.error(i.value);
        break;
      case "WARN":
        logger.warn(i.value);
        break;
      case "START":
        logger.log({ level: "start", message: i.value });
        break;
      case "END":
        logger.log({ level: "end", message: i.value });
        break;

      default:
        console.log("Unknown log type " + i.type);
    }
  });
});

export const runActions = server$(async function* (
  dir: string,
): AsyncGenerator<ScriptYield, void, unknown> {
  const BASE_DIR = this.env.get(WORKING_DIR_KEY);

  if (!BASE_DIR) {
    throw Error(
      `Base directory not found! Please set ${WORKING_DIR_KEY} in the .env file!`,
    );
  }

  const validation = await validateWorkflow(dir, BASE_DIR);

  if (!validation.ok) {
    yield {
      type: "ERROR",
      value: validation.message!,
    };

    throw Error(validation.message);
  }

  const PROJECT_WD = path.join(BASE_DIR, dir, DEPLOY_DIR_NAME);

  const actions = await loadWorkflow(PROJECT_WD);

  yield u.start(actions.name);

  for (const key in actions.jobs) {
    const job = actions.jobs[key as keyof (typeof actions)["jobs"]];

    yield u.info(job.name);

    if (isRunnableJob(job)) {
      const [com, ...cmds] = job.run.split(" ");

      const jobProcess = sh.spawn(com, cmds, { cwd: PROJECT_WD, shell: true });

      for await (const data of jobProcess.stdout) {
        yield u.data((data.toString() as string).trim());
      }

      for await (const data of jobProcess.stderr) {
        yield u.error((data.toString() as string).trim());
      }

      jobProcess.on("exit", (code) => {
        console.log(`[${key}]: ${job.name} exited with code ${code}`);
      });
    } else {
      for (const step of job.steps) {
        yield u.info(step.name);
        const [com, ...cmds] = step.run.split(" ");

        const stepProcess = sh.spawn(com, cmds, {
          cwd: PROJECT_WD,
          shell: true,
        });

        for await (const data of stepProcess.stdout) {
          yield u.data((data.toString() as string).trim());
        }

        for await (const data of stepProcess.stderr) {
          yield u.error((data.toString() as string).trim());
        }

        stepProcess.on("exit", (code) => {
          console.log(`[${step}]: ${job.name} exited with code ${code}`);
        });
      }
    }
  }

  yield u.end();
});

export default component$(() => {
  const streamResponse = useSignal<ScriptYield[]>([]);

  const project = useProject();

  if (!project.value) {
    return <div>Project not found</div>;
  }

  const logs = useLogs();

  const isDeploying = useSignal(false);

  const IsDone = useComputed$(() => {
    if (!isDeploying.value) {
      return true;
    }

    if (!streamResponse.value.length) {
      return false;
    }

    return streamResponse.value[streamResponse.value.length - 1].type === "END";
  });

  const deploy = $(async () => {
    isDeploying.value = true;
    streamResponse.value = [];
    try {
      const res = await runActions(project.value.workingDir);

      for await (const i of res) {
        if (i.type === "START") {
          toast("🚀 " + i.value);
        }

        if (i.type === "SUCCESS") {
          toast.success(i.value);
        }

        if (i.type === "INFO") {
          toast.info(i.value);
        }

        if (i.type === "ERROR") {
          toast.error(i.value);
        }

        streamResponse.value = [...streamResponse.value, i];
        await logDeployment(project.value.slug, [i]);
      }
    } catch (err) {
      console.log({ err });
    }

    isDeploying.value = false;
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (window) {
      window.location.reload();
    }
  });

  return (
    <div class="flex flex-col gap-5 ">
      <div class="flex justify-between">
        <div>
          <h2 class="text-2xl capitalize">{project.value.name}</h2>
          <span class="inline-block rounded-full border border-current px-2 py-0.5 text-xs text-light-2">
            {project.value.slug}
          </span>
        </div>
        <div class="flex items-center gap-5">
          <button
            class="flex items-center gap-1 rounded-xl bg-white p-2.5 pl-4 pr-5 text-black transition-colors hover:bg-white/90 disabled:cursor-not-allowed disabled:text-dark-3"
            disabled={isDeploying.value}
            onClick$={deploy}
          >
            {isDeploying.value ? (
              <>
                <svg
                  class="h-auto w-5 shrink-0 animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 15 15"
                >
                  <path
                    fill="currentColor"
                    fill-rule="evenodd"
                    d="M1.85 7.5c0-2.835 2.21-5.65 5.65-5.65c2.778 0 4.152 2.056 4.737 3.15H10.5a.5.5 0 0 0 0 1h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-1 0v1.813C12.296 3.071 10.666.85 7.5.85C3.437.85.85 4.185.85 7.5c0 3.315 2.587 6.65 6.65 6.65c1.944 0 3.562-.77 4.714-1.942a6.77 6.77 0 0 0 1.428-2.167a.5.5 0 1 0-.925-.38a5.77 5.77 0 0 1-1.216 1.846c-.971.99-2.336 1.643-4.001 1.643c-3.44 0-5.65-2.815-5.65-5.65"
                    clip-rule="evenodd"
                  ></path>
                </svg>
                Deploying...
              </>
            ) : (
              <>
                <svg
                  class="h-auto w-5 shrink-0"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <polygon points="10 8 16 12 10 16 10 8"></polygon>
                </svg>
                Deploy
              </>
            )}
          </button>
        </div>
      </div>

      <div class="max-h-[80vh] flex-1 overflow-y-auto rounded bg-dark-2 px-3 py-5">
        {isDeploying.value ? (
          <ul>
            {streamResponse.value
              .filter((s) => s.type !== "END")
              .map((s, i) => (
                <li
                  key={i + s.value}
                  class={cn(
                    "block",
                    s.type === "INFO" && "mt-2",
                    !IsDone.value && "last:animate-pulse",
                  )}
                >
                  <pre
                    class={cn(
                      "block cursor-pointer  whitespace-break-spaces break-words rounded px-2 py-0.5 text-sm text-white hover:bg-white/5 hover:transition-colors",
                      s.type === "INFO" && "font-medium text-blue-400",
                      s.type === "ERROR" && "text-red-500",
                      s.type === "SUCCESS" && "text-green-500",
                    )}
                  >
                    {s.type === "START" && "🚀 "}
                    {s.type === "SUCCESS" && "✅ "}
                    {s.type === "INFO" ? `[${s.value}]` : s.value}
                  </pre>
                </li>
              ))}
          </ul>
        ) : (
          <div>
            <p class="font-semibold text-white ">
              {logs.value.length > 0 ? "Build logs:" : "No build logs"}
            </p>

            <div class="mt-2.5 space-y-3">
              {logs.value.map((logGroup, index) => (
                <div
                  key={`${index}-${logGroup.timestamp.raw}`}
                  class="pt-2.5 first:pt-0"
                >
                  <span class="inline-block bg-dark-3 p-2 text-sm text-white">
                    Run: {logGroup.timestamp.relative}
                  </span>
                  <ul class="border-l-2 border-dark-3 py-2 pl-2">
                    {logGroup.items
                      .filter((l) => l.level !== "end")
                      .map((buildLog, i) => (
                        <li
                          key={i + buildLog.timestamp.raw}
                          class={cn(
                            "flex gap-3",
                            buildLog.level === "info" && "mt-2",
                          )}
                        >
                          <span class="shrink-0 text-sm text-white/90">
                            {buildLog.timestamp.raw}
                          </span>
                          <pre
                            class={cn(
                              "block cursor-pointer whitespace-break-spaces  break-words rounded  px-2 py-0.5 text-sm text-white hover:bg-white/5 hover:transition-colors",
                              buildLog.level === "info" &&
                                "font-medium text-blue-400",
                              buildLog.level === "error" && "text-red-500",
                              buildLog.level === "success" && "text-green-500",
                            )}
                          >
                            {buildLog.level === "start" && "🚀 "}
                            {buildLog.level === "success" && "✅ "}
                            {buildLog.level === "info"
                              ? `[${buildLog.message}]`
                              : buildLog.message}
                          </pre>
                        </li>
                      ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

export const head: DocumentHead = ({ resolveValue }) => {
  const p = resolveValue(useProject);

  return {
    title: p
      ? `${p.name
          .split(" ")
          .map((w) => w[0].toUpperCase() + w.slice(1))
          .join(" ")} Project`
      : "Project",
  };
};
