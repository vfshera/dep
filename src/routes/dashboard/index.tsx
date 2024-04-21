import { component$, useSignal } from "@builder.io/qwik";
import slugify from "slugify";
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
import { WORKING_DIR_KEY } from "~/constants";
import { createProject, getProjects } from "~/db/queries";
import { validateWorkflow } from "~/lib/workflow";
import { toast } from "qwik-sonner";

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

    const validation = await validateWorkflow(data.dir, BASE_DIR);

    if (!validation.ok) {
      return { success: validation.ok, message: validation.message };
    }

    const [p] = await createProject({
      name: data.name,
      slug: slugify(data.name, { lower: true, trim: true }),
      workingDir: data.dir,
      active: true,
    });

    toast.success(p.slug);
    toast.success("Project created successfully");

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

      <dialog ref={addDialogRef} class="bg-transparent backdrop:bg-black/70">
        <div class="mt-[20vh] rounded bg-white p-8">
          <Form
            action={createAction}
            class="space-y-5"
            onSubmitCompleted$={() => addDialogRef.value?.close()}
          >
            <Input type="text" placeholder="Name" name="name" />

            {createAction.value?.failed && (
              <Errors errors={createAction.value.fieldErrors.name} />
            )}

            <div class="flex items-center rounded  border border-black px-2 py-1">
              <span class="text-gray-800">BASE_DIR </span>
              <span class="text-lg font-medium text-gray-800">/</span>

              <Input
                type="text"
                placeholder="Directory"
                name="dir"
                class="bg-white px-2 py-0.5"
              />
            </div>

            {createAction.value?.failed && (
              <Errors errors={createAction.value.fieldErrors.dir} />
            )}

            <div class="grid grid-cols-2 gap-5 ">
              <button
                type="submit"
                class="rounded-xl bg-black py-2 pl-4 pr-5 text-center text-white hover:shadow-lg"
              >
                Create Project
              </button>
              <button
                type="button"
                onClick$={() => addDialogRef.value?.close()}
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
