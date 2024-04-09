import { Slot, component$ } from "@builder.io/qwik";
import Nav from "./Nav";
import { type RequestHandler, type DocumentHead } from "@builder.io/qwik-city";
import { Toaster } from "qwik-sonner";
import { type Session } from "@auth/core/types";

export const onRequest: RequestHandler = (event) => {
  const session: Session | null = event.sharedMap.get("session");

  const ALLOWED_USERS = event.env.get("ALLOWED_USERS")?.split(",");

  if (!session || new Date(session.expires) < new Date() || !ALLOWED_USERS) {
    throw event.redirect(
      302,
      `/api/auth/signin?callbackUrl=${event.url.pathname}`,
    );
  }

  if (!session.user?.email || !ALLOWED_USERS.includes(session.user.email)) {
    throw event.redirect(302, "/");
  }
};

export default component$(() => {
  return (
    <main class="flex min-h-screen flex-col">
      <Nav />

      <Slot />

      <Toaster expand richColors />
    </main>
  );
});

export const head: DocumentHead = ({ head }) => {
  return {
    title: head.title ? `${head.title} | Dashboard` : "Dashboard",
  };
};
