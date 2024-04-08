import { Slot, component$ } from "@builder.io/qwik";
import { Link, type DocumentHead } from "@builder.io/qwik-city";

export { useTemplate } from "./loaders";
import { useTemplate } from "./loaders";

export default component$(() => {
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
          <Link href={`/dashboard/${t.value.id}`} class="font-semibold">
            {t.value.name} Template
          </Link>
          <p class="mt-2 text-sm text-gray-600">{t.value.description}</p>
        </div>
      </div>

      <div class="flex flex-col gap-5 p-5">
        <Slot />
      </div>
    </div>
  );
});

export const head: DocumentHead = ({ resolveValue }) => {
  const t = resolveValue(useTemplate);
  return {
    title: t?.name,
  };
};
