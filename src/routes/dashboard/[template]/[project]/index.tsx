import { $, component$, useComputed$, useSignal } from "@builder.io/qwik";
import { toast } from "qwik-sonner";
// import { useQwikTable } from "@tanstack/qwik-table";

export { useProjects } from "../loaders";
import { useTemplate, useProjects } from "../loaders";

import { type ScriptYield } from "~/types";
import { cn } from "~/utils";
import { type DocumentHead, routeLoader$ } from "@builder.io/qwik-city";

export const useProject = routeLoader$(
  async ({ params, resolveValue, status }) => {
    const projects = await resolveValue(useProjects);
    const project = projects.find((p) => p.id === params.project);

    if (!project) {
      status(404);
    }

    return project;
  },
);

export default component$(() => {
  const streamResponse = useSignal<ScriptYield[]>([]);
  const t = useTemplate();
  const project = useProject();

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

  if (!t.value || !project.value) {
    return (
      <div class="flex flex-col gap-5 p-5">
        <p class="text-red-500">Project Not Found!</p>
      </div>
    );
  }

  const deploy = $(async () => {
    isDeploying.value = true;

    streamResponse.value = [];

    const res = await t.value.handler({
      WORKING_DIR: project.value.id,
    });

    for await (const i of res) {
      if (i.type === "START") {
        toast("🚀 " + i.value);
      }

      if (i.type === "END") {
        toast.success(i.value);
      }

      if (i.type === "INFO") {
        toast.info(i.value);
      }

      if (i.type === "ERROR") {
        toast.error(i.value);
      }

      streamResponse.value = [...streamResponse.value, i];
    }

    isDeploying.value = false;
  });

  return (
    <div class="flex flex-col gap-5 ">
      <div class="flex justify-between">
        <div>
          <h2 class="text-2xl capitalize">{project.value.name}</h2>
          <span class="inline-block rounded-full border border-current px-2 py-1 text-sm text-gray-600">
            {project.value.id}
          </span>
        </div>
        <div>
          <button
            class="flex items-center gap-1 rounded-xl bg-black p-2.5 pl-4 pr-5 text-white disabled:cursor-not-allowed disabled:text-white/70"
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
      <hr />
      <div class="flex-1 rounded bg-[#111] px-3 py-5">
        <ul>
          {streamResponse.value.map((s, i) => (
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
                  "block cursor-pointer rounded px-2 py-0.5 text-sm  text-white hover:bg-white/5 hover:transition-colors",
                  s.type === "INFO" && "font-medium text-blue-400",
                  s.type === "ERROR" && "text-red-500",
                )}
              >
                {s.type === "START" && "🚀 "}
                {s.type === "END" && "✅ "}
                {s.type === "INFO" ? `[${s.value}]` : s.value}
              </pre>
            </li>
          ))}
        </ul>
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