import type { Signal } from "@builder.io/qwik";
import { component$ } from "@builder.io/qwik";
import type { ScriptYield } from "~/types";
import { cn } from "~/utils";

type LogStreamProps = {
  logs: Signal<ScriptYield[]>;
  isDone: Signal<boolean>;
};
export default component$<LogStreamProps>(({ logs, isDone }) => {
  return (
    <div id="logs-stream" class="rounded bg-dark-2 p-1.5">
      <ul>
        {logs.value
          .filter((s) => s.type !== "END")
          .filter((s) => s.type !== "GITINFO")
          .map((s, i) => (
            <li
              key={i + s.value}
              class={cn(
                "block",
                s.type === "INFO" && "mt-2",
                !isDone.value && "last:animate-pulse",
              )}
            >
              <pre
                class={cn(
                  "block cursor-pointer whitespace-break-spaces break-words rounded px-2 py-0.5 text-sm text-white hover:bg-white/5 hover:transition-colors",
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
    </div>
  );
});
