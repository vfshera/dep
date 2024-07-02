import { component$ } from "@builder.io/qwik";

export default component$(() => {
  return (
    <main class="relative flex flex-1  items-center justify-center bg-white bg-grid-black/[0.2] dark:bg-black dark:bg-grid-white/[0.2]">
      <div class="pointer-events-none absolute inset-0 flex items-center justify-center bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] dark:bg-black"></div>

      <div class="flex flex-col items-center">
        <h1 class="relative z-20 bg-gradient-to-b from-neutral-200 to-neutral-500 bg-clip-text py-8 text-4xl font-bold text-transparent sm:text-7xl">
          Deployer
        </h1>
        <a
          href="/dashboard"
          class="mt-5 rounded-full border border-blue-700 bg-black/60 px-8 py-4 text-neutral-200"
        >
          Go to Dashboard
        </a>
      </div>
    </main>
  );
});
