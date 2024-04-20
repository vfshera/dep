import { component$, useSignal } from "@builder.io/qwik";
import {
  routeAction$,
  zod$,
  z,
  Form,
  routeLoader$,
  Link,
} from "@builder.io/qwik-city";

import Input from "~/components/ui/form/Input";
import Errors from "~/components/ui/form/Errors";
import { exists } from "~/lib/shell";
import {
  DEPLOY_DIR_NAME,
  DEPLOY_FILE_NAME,
  WORKING_DIR_KEY,
} from "~/constants";
import path from "path";
import { createProject, getProjects } from "~/db/queries";

export const useProjects = routeLoader$(async () => {
  const projects = await getProjects();

  return projects;
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

    res = await exists(DEPLOY_DIR_NAME, path.join(BASE_DIR, data.dir));

    if (!res.ok) {
      return {
        success: false,
        message: `'${DEPLOY_DIR_NAME}' directory is not found in '${data.dir}'!`,
      };
    }

    res = await exists(
      DEPLOY_FILE_NAME,
      path.join(BASE_DIR, data.dir, DEPLOY_DIR_NAME),
    );

    if (!res.ok) {
      return {
        success: false,
        message: `'${DEPLOY_FILE_NAME.join(" or ")}' script is not found in '${data.dir}'!`,
      };
    }

    const p = await createProject({
      name: data.name,
      workingDir: data.dir,
      active: true,
    });

    console.log({ p });

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
  }),
);

export default component$(() => {
  const projects = useProjects();

  const addDialogRef = useSignal<HTMLDialogElement>();

  const createAction = useCreateProject();

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
        {projects.value.map((p) => (
          <li key={p.id} class="border border-b-gray-700 last:border-none">
            <Link
              href={`/dashboard/${p.id}`}
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

            {createAction.value?.success && (
              <div class="text-green-500">Success!</div>
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
