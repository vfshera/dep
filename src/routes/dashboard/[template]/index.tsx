import { component$, useSignal } from "@builder.io/qwik";
import {
  type DocumentHead,
  Link,
  routeAction$,
  zod$,
  z,
  Form,
  routeLoader$,
} from "@builder.io/qwik-city";
import { useTemplate } from "./loaders";

import { useProjects } from "./loaders";
import Input from "~/components/ui/form/Input";
import Select from "~/components/ui/form/Select";
import scripts from "~/scripts";
import Errors from "~/components/ui/form/Errors";
import { exists } from "~/lib/shell";
import { DEPLOY_SCRIPT_NAME, WORKING_DIR_KEY } from "~/constants";
import path from "path";
export { useProjects } from "./loaders";

export const useTemplates = routeLoader$(() => {
  return scripts.map((s) => ({ id: s.id, name: s.name }));
});

export const useCreateProject = routeAction$(
  async (data, req) => {
    const BASE_DIR = req.env.get(WORKING_DIR_KEY);

    if (!BASE_DIR || BASE_DIR === "") {
      return {
        success: false,
        message: "Invalid BASE_DIR!",
      };
    }

    let res = await exists(data.dir, BASE_DIR);

    if (!res.ok) {
      return {
        success: false,
        message: `Template '${data.dir}' does not exist!`,
      };
    }

    res = await exists(DEPLOY_SCRIPT_NAME, path.join(BASE_DIR, data.dir));

    if (!res.ok) {
      return {
        success: false,
        message: `'${DEPLOY_SCRIPT_NAME}' script is not found in '${data.dir}'!`,
      };
    }

    return { success: true, message: "Project created successfully" };
  },
  zod$({
    name: z.string().min(5, "Name must be at least 5 characters long"),
    dir: z
      .string()
      .min(5, "Directory must be at least 5 characters long")
      .refine((v) => !v.startsWith("/"), {
        message: `Remove the leading slash from directory name`,
      })
      .refine((v) => !v.includes("/"), {
        message: "Sub-directories are not allowed",
      }),
    template: z.string(),
  }),
);

export default component$(() => {
  const t = useTemplate();

  const templates = useTemplates();

  const projects = useProjects();

  const addDialogRef = useSignal<HTMLDialogElement>();

  const createAction = useCreateProject();

  if (!t.value) {
    return (
      <div class="flex flex-col gap-5 p-5">
        <p class="text-red-500">Template Not Found!</p>
      </div>
    );
  }

  return (
    <div class="space-y-5 ">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-semibold">Projects</h1>

        <button
          onClick$={() => addDialogRef.value?.showModal()}
          class="flex items-center gap-1 rounded-xl bg-black p-2.5 pl-4 pr-5 text-white disabled:cursor-not-allowed disabled:text-white/70"
        >
          <svg
            class="h-auto w-5 shrink-0"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 15 15"
          >
            <path
              fill="currentColor"
              fill-rule="evenodd"
              d="M8 2.75a.5.5 0 0 0-1 0V7H2.75a.5.5 0 0 0 0 1H7v4.25a.5.5 0 0 0 1 0V8h4.25a.5.5 0 0 0 0-1H8z"
              clip-rule="evenodd"
            ></path>
          </svg>
          Add
        </button>
      </div>

      <ul class="border border-gray-700">
        {projects.value.map((p, index) => (
          <li
            key={p.id + index}
            class="border border-b-gray-700 last:border-none"
          >
            <Link
              href={`/dashboard/${t.value.id}/${p.id}`}
              class="flex px-5 py-4 capitalize text-gray-800 hover:bg-slate-50 "
            >
              {p.name}
            </Link>
          </li>
        ))}
      </ul>

      <dialog ref={addDialogRef} class="backdrop:bg-black/70">
        <div class="bg-white p-5">
          <Form action={createAction} class="space-y-3">
            <Input type="text" placeholder="Name" name="name" />

            {createAction.value?.failed && (
              <Errors errors={createAction.value.fieldErrors.name} />
            )}

            <div class="flex items-center gap-1 rounded bg-slate-200 px-2 py-1">
              <span class="text-gray-800">BASE_DIR </span>
              <span class="text-2xl font-semibold text-gray-800">/</span>

              <Input
                type="text"
                placeholder="Directory"
                name="dir"
                class="bg-white px-2 py-0.5"
              />
            </div>

            {createAction.value?.success !== undefined &&
              !createAction.value.success && (
                <Errors errors={[createAction.value.message]} />
              )}

            {createAction.value?.failed && (
              <Errors errors={createAction.value.fieldErrors.dir} />
            )}

            <Select
              defaultOption="Choose Template"
              name="template"
              items={templates.value.map((tem) => ({
                name: tem.name,
                value: tem.id,
              }))}
            />
            {createAction.value?.failed && (
              <Errors errors={createAction.value.fieldErrors.template} />
            )}
            <button
              type="submit"
              class="flex items-center gap-1 rounded-xl bg-black p-2.5 pl-4 pr-5 text-white disabled:cursor-not-allowed disabled:text-white/70"
            >
              Create Project
            </button>
          </Form>
        </div>
      </dialog>
    </div>
  );
});

export const head: DocumentHead = ({ resolveValue }) => {
  const t = resolveValue(useTemplate);

  return {
    title: t?.name ? `${t.name} Template` : "Template",
  };
};
