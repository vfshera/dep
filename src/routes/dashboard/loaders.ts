/* eslint-disable qwik/loader-location */
import { routeLoader$ } from "@builder.io/qwik-city";
import { ls } from "~/lib/shell";
import scripts from "~/scripts";

export const useTemplate = routeLoader$(({ params, status }) => {
  const template = scripts.find((s) => s.id === params.template);

  if (!template) {
    status(404);
  }

  return template;
});

export const useProjects = routeLoader$(async ({ env }) => {
  const wd = env.get("CMD_WORKING_DIR") || "";

  const lsres = await ls(wd);

  return lsres.stdout
    .split("\n")
    .filter(Boolean)
    .map((p) => ({ id: p.trim(), name: p.trim().split("-").join(" ") }));
});
