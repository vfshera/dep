import { Slot, component$ } from "@builder.io/qwik";
import Nav from "./Nav";
import { type RequestHandler, type DocumentHead } from "@builder.io/qwik-city";
import { Toaster } from "qwik-sonner";
import { type Session } from "@auth/core/types";

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
    <main class="flex min-h-screen flex-col">
      <Nav />

      <div class="grid flex-1 grid-cols-[350px,1fr]">
        <div class="p-5">
          {/*  <div class="rounded-xl border border-gray-300 bg-white p-5 shadow-sm">
          <Link href={`/dashboard/${t.value.id}`} class="font-semibold">
            {t.value.name} Template
          </Link>
          <p class="mt-2 text-sm text-gray-600">{t.value.description}</p>
        </div> */}
        </div>

        <div class="flex flex-col gap-5 p-5">
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
