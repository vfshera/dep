import { Slot, component$ } from "@builder.io/qwik";
import Nav from "./Nav";
import Sidebar from "./Sidebar";
import { type DocumentHead } from "@builder.io/qwik-city";

export default component$(() => {
  return (
    <main class="flex min-h-screen flex-col">
      <Nav />
      <div class="grid flex-1 grid-cols-[250px,1fr]">
        <Sidebar />
        <div class="p-5 pt-2.5">
          <Slot />
        </div>
      </div>
    </main>
  );
});

export const head: DocumentHead = {
  title: "Dashboard - Deployer",
};
