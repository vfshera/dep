import type { Signal } from "@builder.io/qwik";
import { component$, useSignal } from "@builder.io/qwik";
import { cn, type PrettyLogsOutput } from "~/utils";

type LogGroupProps = {
  logGroup: Awaited<PrettyLogsOutput>[number];
};

function getCommitTime(timeString: string) {
  try {
    const date = new Date(timeString);

    if (isNaN(date.getTime())) {
      throw new Error("Invalid date format");
    }

    return date.toLocaleString();
  } catch (error) {
    return timeString;
  }
}

function sanitizeCommit(commit: string) {
  try {
    const obj = JSON.parse(commit) as {
      hash: string;
      message: string;
      time: string;
    };

    const { hash, message, time } = obj;

    return { hash, message, timestamp: getCommitTime(time) };
  } catch (e) {
    return { hash: null, message: null, timestamp: null };
  }
}

export default component$<LogGroupProps>(({ logGroup }) => {
  const open = useSignal(false);

  return (
    <div onClick$={() => (open.value = !open.value)} class="relative">
      <div
        class={[
          "grid transition-[grid-template-rows] duration-300 ease-in-out",
          open.value ? "grid-rows-[0fr]" : "cursor-pointer grid-rows-[1fr]",
        ]}
      >
        <div class="overflow-hidden bg-dark-2">
          <div>
            <div class="flex items-center gap-3">
              <span
                class={[
                  "inline-block bg-dark-3 px-2 py-1.5 text-sm text-white",
                ]}
              >
                {logGroup.timestamp.relative}
              </span>
            </div>
            <div class="flex items-center gap-2 p-2.5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="size-5"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                />
              </svg>
              {logGroup.timestamp.raw}
            </div>
          </div>
        </div>
      </div>

      <div
        class={[
          "grid transition-[grid-template-rows] duration-500 ease-in-out",
          open.value ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        ]}
      >
        <div class="overflow-hidden">
          <div
            key={`${logGroup.timestamp.raw}`}
            class=" rounded  bg-dark-2 p-1 pt-2.5 first:pt-0"
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
                      buildLog.level === "gitinfo" && "py-1",
                      !open.value &&
                        buildLog.level === "gitinfo" &&
                        "absolute right-2 top-1/2 -translate-y-1/2",
                    )}
                  >
                    {buildLog.level !== "gitinfo" && (
                      <span class="shrink-0 text-sm text-white/90">
                        {buildLog.timestamp.raw}
                      </span>
                    )}
                    <pre
                      class={cn(
                        "block cursor-pointer whitespace-break-spaces  break-words rounded  px-2 py-0.5 text-sm text-white hover:bg-white/5 hover:transition-colors",
                        buildLog.level === "info" &&
                          "font-medium text-blue-400",
                        buildLog.level === "error" && "text-red-500",
                        buildLog.level === "success" && "text-green-500",
                        buildLog.level === "gitinfo" &&
                          "border-2 border-dashed border-white/30 bg-dark-1 p-3  ",
                      )}
                    >
                      {buildLog.level === "start" && "🚀 "}
                      {buildLog.level === "success" && "✅ "}
                      {buildLog.level === "info" ? (
                        `[${buildLog.message}]`
                      ) : buildLog.level === "gitinfo" ? (
                        <Commit
                          {...sanitizeCommit(buildLog.message)}
                          open={open}
                        />
                      ) : (
                        buildLog.message
                      )}
                    </pre>
                  </li>
                ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
});

export const Commit = component$<{
  hash: string | null;
  message: string | null;
  timestamp: string | null;
  open: Signal<boolean>;
}>(({ hash, message, timestamp, open }) => {
  return (
    <span class="grid grid-cols-1">
      <span>Commit: {hash}</span>
      <span>Message: "{message}"</span>
      {open.value && <span>Time: {timestamp}</span>}
    </span>
  );
});
