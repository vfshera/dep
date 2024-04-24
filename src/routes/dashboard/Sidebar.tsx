import { component$ } from "@builder.io/qwik";
import { useAuthSession, useAuthSignout } from "../plugin@auth";
import { Link } from "@builder.io/qwik-city";

export default component$(() => {
  const session = useAuthSession();

  const signout = useAuthSignout();

  return (
    <aside>
      <Link
        href="/dashboard"
        class="hover:bg-dark-3 block p-5 text-xl font-bold tracking-tight dark:text-white"
      >
        Dashboard
      </Link>

      <div class="space-y-5 *:p-5">
        <div class="text-light-2 border-dark-3 flex  flex-col gap-1 border-y">
          <p>{session.value?.user?.name}</p>
          <button
            class="w-max text-red-600"
            onClick$={() => signout.submit({ callbackUrl: "/" })}
          >
            Sign out
          </button>
        </div>
      </div>
    </aside>
  );
});
