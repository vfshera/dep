import { component$ } from "@builder.io/qwik";
import { useAuthSession, useAuthSignout } from "../plugin@auth";

export default component$(() => {
  const session = useAuthSession();

  const signout = useAuthSignout();

  return (
    <aside>
      <a
        href="/dashboard"
        class="block p-5 text-xl font-bold tracking-tight hover:bg-dark-3 dark:text-white"
      >
        Dashboard
      </a>

      <div class="space-y-5 *:p-5">
        <div class="flex flex-col gap-1  border-y border-dark-3 text-light-2">
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
