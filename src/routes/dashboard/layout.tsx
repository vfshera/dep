import { Slot, component$ } from "@builder.io/qwik";
import { type RequestHandler, type DocumentHead } from "@builder.io/qwik-city";
import { Toaster } from "qwik-sonner";
import { type Session } from "@auth/core/types";
import Sidebar from "./Sidebar";

export const onRequest: RequestHandler = async (event) => {
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
    <main class="bg-dark-1 flex min-h-screen flex-col  text-white">
      <div class="grid flex-1 grid-cols-[300px,1fr]">
        <Sidebar />

        <div class="border-dark-3 flex flex-col gap-5 border-l p-5">
          <Slot />
        </div>
      </div>

      <Toaster expand richColors />
    </main>
  );
});

export const head: DocumentHead = ({ head }) => {
  return {
    title: head.title ? `${head.title} | Dashboard` : "Dashboard",
  };
};
