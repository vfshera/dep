import { component$ } from "@builder.io/qwik";
import { Link } from "@builder.io/qwik-city";
import { useTemplate } from "./loaders";
// import { useQwikTable } from "@tanstack/qwik-table";

import { useProjects } from "./loaders";
export { useProjects } from "./loaders";

export default component$(() => {
  const t = useTemplate();
  const projects = useProjects();

  if (!t.value) {
    return (
      <div class="flex flex-col gap-5 p-5">
        <p class="text-red-500">Template Not Found!</p>
      </div>
    );
  }
  return (
    <div class="space-y-5 ">
      <h1 class="text-2xl font-semibold">Projects</h1>

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
    </div>
  );
});
