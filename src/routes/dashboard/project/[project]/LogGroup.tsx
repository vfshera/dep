import { component$ } from "@builder.io/qwik";
import { cn, type PrettyLogsOutput } from "~/utils";

type LogGroupProps = {
  logGroup: Awaited<PrettyLogsOutput>[number];
};

export default component$<LogGroupProps>(({ logGroup }) => {
  return (
    <div
      key={`${logGroup.timestamp.raw}`}
      class="rounded bg-dark-2  p-1 pt-2.5 first:pt-0 "
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
              class={cn("flex gap-3", buildLog.level === "info" && "mt-2")}
            >
              <span class="shrink-0 text-sm text-white/90">
                {buildLog.timestamp.raw}
              </span>
              <pre
                class={cn(
                  "block cursor-pointer whitespace-break-spaces  break-words rounded  px-2 py-0.5 text-sm text-white hover:bg-white/5 hover:transition-colors",
                  buildLog.level === "info" && "font-medium text-blue-400",
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
  );
});
