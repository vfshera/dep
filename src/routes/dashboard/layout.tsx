import { Slot, component$ } from "@builder.io/qwik";
import Nav from "./Nav";
import { type DocumentHead } from "@builder.io/qwik-city";
import { Toaster } from "qwik-sonner";

export default component$(() => {
  return (
    <main class="flex min-h-screen flex-col">
      <Nav />

      <Slot />

      <Toaster expand richColors />
    </main>
  );
});

export const head: DocumentHead = {
  title: "Dashboard - Deployer",
};
