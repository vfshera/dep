import { component$, useComputed$, useSignal } from "@builder.io/qwik";
import { routeLoader$ } from "@builder.io/qwik-city";
import { toast } from "qwik-sonner";
// import { useQwikTable } from "@tanstack/qwik-table";

import scripts from "~/scripts";
import { type ScriptYield } from "~/types";
import { cn } from "~/utils";

export const useTemplate = routeLoader$(({ params, status }) => {
  const template = scripts.find((s) => s.id === params.template);

  if (!template) {
    status(404);
  }

  return template;
});

export default component$(() => {
  const streamResponse = useSignal<ScriptYield[]>([]);

  const IsDone = useComputed$(() => {
    if (!streamResponse.value.length) {
      return false;
    }

    return streamResponse.value[streamResponse.value.length - 1].type === "END";
  });

  const t = useTemplate();

  if (!t.value) {
    return (
      <div class="flex flex-col gap-5 p-5">
        <p class="text-red-500">Template Not Found!</p>
      </div>
    );
  }

  return (
    <div class="grid flex-1 grid-cols-[350px,1fr]">
      <div class="p-5">
        <div class="rounded-xl border border-gray-300 bg-white p-5 shadow-sm">
          <p class="font-semibold">{t.value.name} Template</p>
          <p class="mt-2 text-sm text-gray-600">{t.value.description}</p>
        </div>
      </div>

      <div class="flex flex-col gap-5 p-5">
        <div>
          <button
            class="flex items-center gap-1 rounded-lg bg-black p-2 pl-4 pr-5 text-white"
            onClick$={async () => {
              streamResponse.value = [];
              const res = await t.value.handler({
                WORKING_DIR: "astro-suspense",
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
            }}
          >
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
            Run {t.value.name}
          </button>
        </div>

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
    </div>
  );
});
