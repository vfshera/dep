import { $, component$, useComputed$, useSignal } from "@builder.io/qwik";
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
import { checkIfProjectExists, createProject, getProjects } from "~/db/queries";
import { listProjects, validateWorkflow } from "~/lib/workflow";
import { toast } from "qwik-sonner";

export const useProjects = routeLoader$(async (ctx) => {
  const list = await listProjects(ctx.env.get(WORKING_DIR_KEY) as string);

  const projects = await getProjects();

  return { projects, currentProjects: list };
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

    const newProject = {
      name: data.name,
      slug: slugify(data.name, { lower: true, trim: true }),
      workingDir: data.dir,
      active: true,
    };

    const existingProject = await checkIfProjectExists(
      newProject.slug,
      newProject.workingDir,
    );

    if (existingProject) {
      toast.error("Project already exists!");

      return { success: false, message: "Project already exists!" };
    }

    const [p] = await createProject(newProject);

    if (!p.id) {
      toast.error("Failed to create project!");

      return { success: false, message: "Failed to create project!" };
    }

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
  const projectData = useProjects();

  const addDialogRef = useSignal<HTMLDialogElement>();

  const createAction = useCreateProject();

  const autocomplete = useComputed$(() => {
    const plist = projectData.value.currentProjects.projects?.map((p) => {
      const isAvailable = projectData.value.projects.some(
        (project) => project.workingDir === p,
      );

      return {
        slug: p,
        isValid: !isAvailable,
      };
    });

    return plist || [];
  });

  return (
    <div class="space-y-5 ">
      <div class="flex items-center justify-between">
        <h1 class="text-xl font-semibold">Projects</h1>

        <button
          onClick$={() => addDialogRef.value?.showModal()}
          class="flex items-center gap-1 rounded-xl bg-black py-2 pl-4 pr-5 text-white disabled:cursor-not-allowed disabled:text-white/70 dark:bg-white/90 dark:text-[#111]"
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

      {projectData.value.projects.length > 0 ? (
        <ul class="space-y-1">
          {projectData.value.projects.map((p) => (
            <li
              key={p.id}
              class="rounded bg-dark-2 transition-colors hover:bg-dark-3"
            >
              <Link
                href={`/dashboard/project/${p.slug}`}
                class="flex px-5 py-3 capitalize text-light-2"
              >
                {p.name}
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div class="flex items-center justify-center p-10">
          <p>No Projects found!</p>
        </div>
      )}

      <dialog ref={addDialogRef} class="bg-transparent backdrop:bg-black/70">
        <div class="mt-[20vh] rounded bg-white p-8">
          <Form
            action={createAction}
            class="space-y-5"
            onSubmitCompleted$={$(() => {
              if (createAction.value?.success) {
                toast.success(
                  createAction.value.message || "Project created successfully",
                );

                addDialogRef.value?.close();

                return;
              } else {
                toast.error(
                  createAction.value?.message || "Failed to create project",
                );
              }
            })}
          >
            <Input type="text" placeholder="Name" name="name" />

            {createAction.value?.failed && (
              <Errors errors={createAction.value.fieldErrors.name} />
            )}

            {/* <div class="flex items-center rounded  border border-black px-2 py-1">
              <span class="text-gray-800">BASE_DIR </span>
              <span class="text-lg font-medium text-gray-800">/</span>

              <Input
                type="text"
                placeholder="Directory"
                name="dir"
                class="bg-white px-2 py-0.5"
              />
            </div> */}

            <select
              name="dir"
              class="w-full rounded border border-black bg-transparent p-2.5 capitalize text-gray-700  accent-black "
            >
              <option value="">Select Project...</option>
              {autocomplete.value.map((p) => (
                <option
                  value={p.slug}
                  key={p.slug}
                  disabled={!p.isValid}
                  class="disabled:cursor-not-allowed disabled:text-gray-400"
                >
                  {p.slug}
                </option>
              ))}
            </select>
            {createAction.value?.failed && (
              <Errors errors={createAction.value.fieldErrors.dir} />
            )}

            {!createAction.value?.failed &&
              typeof createAction.value?.success !== "undefined" && (
                <div>
                  {createAction.value.success && (
                    <small class="text-green-600">
                      {createAction.value.message}
                    </small>
                  )}
                  {!createAction.value.success && (
                    <small class="text-red-600">
                      {createAction.value.message || "Failed to create project"}
                    </small>
                  )}
                </div>
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
