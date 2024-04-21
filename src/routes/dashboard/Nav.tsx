import { component$ } from "@builder.io/qwik";
import { Link } from "@builder.io/qwik-city";
import { useAuthSession, useAuthSignout } from "../plugin@auth";

export default component$(() => {
  const session = useAuthSession();

  const signout = useAuthSignout();

  return (
    <header class="sticky top-0 z-50 flex h-12 items-center justify-between border-b bg-white px-5">
      <Link href="/dashboard" class="text-xl font-bold tracking-tight">
        Dashboard
      </Link>

      <div class="flex items-center gap-3">
        <p>{session.value?.user?.name}</p>
        <button
          class="text-red-600"
          onClick$={() => signout.submit({ callbackUrl: "/" })}
        >
          Sign out
        </button>
      </div>
    </header>
  );
});
