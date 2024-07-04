import { $, component$, useComputed$, useSignal } from "@builder.io/qwik";
import { toast } from "qwik-sonner";

import type { ScriptYield } from "~/types";
import {
  type DocumentHead,
  routeLoader$,
  server$,
  Form,
  routeAction$,
  zod$,
  z,
} from "@builder.io/qwik-city";

import { getProjectBySlug, updateProjectName } from "~/db/queries";
import { WORKING_DIR_KEY } from "~/constants";
import LogStream from "./LogStream";
import LogGroup from "./LogGroup";
import Input from "~/components/ui/form/Input";
import {
  logDeploymentInfo,
  getLogs,
  type PrettyLogsOutput,
} from "~/lib/logger/utils";
import { runner } from "~/lib/workflow/runner";

export const useProject = routeLoader$(async ({ params, status }) => {
  const project = await getProjectBySlug(params.project);

  if (!project) {
    status(404);
  }

  return project;
});

export const useLogs = routeLoader$(
  async ({ resolveValue }): PrettyLogsOutput => {
    const p = await resolveValue(useProject);

    if (!p) return [];

    return getLogs(p.slug);
  },
);

export const logDeployment = server$(logDeploymentInfo);

export const runActions = server$(async function* (
  dir: string,
): AsyncGenerator<ScriptYield, void, unknown> {
  const BASE_DIR = this.env.get(WORKING_DIR_KEY);

  if (!BASE_DIR) {
    throw Error(
      `Base directory not found! Please set ${WORKING_DIR_KEY} in the .env file!`,
    );
  }

  yield* runner(dir, BASE_DIR);
});

export const useRenameProject = routeAction$(
  async (data, ctx) => {
    const project = await getProjectBySlug(data.slug);

    if (!project) {
      return { success: false, message: "Project not found" };
    }

    const [res] = await updateProjectName(data.slug, data.name);

    if (!res) {
      return { success: false, message: "Failed to rename project" };
    }

    return {
      success: true,
      message: `Project ${data.name} renamed to ${res.updatedName} successfully!`,
    };
  },
  zod$({
    name: z.string().min(5, "Name must be at least 5 characters long"),
    slug: z.string(),
  }),
);

export default component$(() => {
  const renameAction = useRenameProject();

  const streamResponse = useSignal<ScriptYield[]>([]);

  const renameModalRef = useSignal<HTMLDialogElement>();

  const project = useProject();

  if (!project.value) {
    return <NotFound />;
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
      console.log("Deploy Error");

      if (err instanceof Error) {
        console.log(err.message);
      }

      return;
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
          <div class="flex items-center gap-2">
            <h2 class="text-2xl capitalize">{project.value.name}</h2>
            <span class="mx-2 h-full w-px shrink-0 bg-white/70 ">&nbsp;</span>
            <button
              type="button"
              onClick$={() => renameModalRef.value?.showModal()}
              class="text-white/90 transition-colors duration-300 hover:text-white"
              title="Rename Project"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="size-6"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                />
              </svg>
            </button>
          </div>
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

      <div class="max-h-[88vh] flex-1 overflow-y-auto">
        <div class="h-full overflow-y-auto py-5 pr-3">
          {isDeploying.value ? (
            <LogStream logs={streamResponse} isDone={IsDone} />
          ) : (
            <div>
              <p class="px-1 font-semibold text-white">
                {logs.value.length > 0 ? "Build logs:" : "No build logs"}
              </p>

              <div class="mt-2.5 space-y-3">
                {logs.value.map((logGroup, index) => (
                  <LogGroup key={index} logGroup={logGroup} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <dialog ref={renameModalRef} class="bg-transparent backdrop:bg-black/70">
        <div class="  rounded bg-white p-8">
          <Form
            action={renameAction}
            onSubmitCompleted$={$(() => {
              if (renameAction.value?.success) {
                toast.success(
                  renameAction.value.message || "Project renamed successfully",
                );

                renameModalRef.value?.close();

                return;
              } else {
                toast.error(
                  renameAction.value?.message || "Failed to rename project",
                );
              }
            })}
            class="space-y-5"
          >
            <Input
              type="text"
              placeholder="New Name"
              name="name"
              value={project.value.name}
            />
            <input
              class="hidden"
              type="text"
              name="slug"
              value={project.value.slug}
            />
            <div class="grid grid-cols-2 gap-5 ">
              <button
                type="submit"
                disabled={renameAction.isRunning}
                class={[
                  "rounded-xl bg-black py-2 pl-4 pr-5 text-center text-white hover:shadow-lg",
                  renameAction.isRunning && "animate-pulse cursor-not-allowed",
                ]}
              >
                Rename Project
              </button>
              <button
                type="button"
                onClick$={() => renameModalRef.value?.close()}
                class="rounded-xl border border-black bg-white py-2 pl-4 pr-5 text-black shadow hover:shadow-lg"
              >
                Close
              </button>
            </div>
          </Form>
        </div>
      </dialog>
    </div>
  );
});

export const NotFound = component$(() => {
  return (
    <div class="space-y-5">
      <div class="flex items-center gap-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="size-7 text-red-600"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
          <line x1="12" x2="12" y1="8" y2="12" />
          <line x1="12" x2="12.01" y1="16" y2="16" />
        </svg>
        <h2 class="text-2xl capitalize">Project not found!</h2>
      </div>

      <div>
        <a href="/dashboard" class="block w-max rounded bg-dark-3 px-5 py-2 ">
          Go to Dashboard
        </a>
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
