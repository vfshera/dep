import { component$ } from "@builder.io/qwik";
import { useAuthSession, useAuthSignout } from "../plugin@auth";
import { useAppContext } from "~/context/app-context";

export default component$(() => {
  const session = useAuthSession();

  const signout = useAuthSignout();

  const appStore = useAppContext();

  return (
    <aside class="relative">
      <div
        class={[
          "absolute right-0",
          appStore.sidebarCollapsed ? "top-0 translate-x-1/2" : "top-5",
        ]}
      >
        <button
          type="button"
          class="flex size-8 items-center justify-center bg-dark-1 text-white transition-all duration-200 hover:bg-white hover:text-black"
          onClick$={() =>
            (appStore.sidebarCollapsed = !appStore.sidebarCollapsed)
          }
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class={[
              "size-6 transition-transform duration-300",
              appStore.sidebarCollapsed ? "rotate-180" : "rotate-0",
            ]}
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="m18.75 4.5-7.5 7.5 7.5 7.5m-6-15L5.25 12l7.5 7.5"
            />
          </svg>
        </button>
      </div>
      <a
        href="/dashboard"
        class="block p-5 text-xl font-bold tracking-tight hover:bg-dark-3 dark:text-white"
        title="Dashboard"
      >
        {appStore.sidebarCollapsed ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="size-6"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
            />
          </svg>
        ) : (
          "Dashboard"
        )}
      </a>

      <div class="space-y-5 *:p-5">
        <div class="flex flex-col gap-1 border-y border-dark-3 text-light-2">
          {appStore.sidebarCollapsed ? (
            <div
              class="cursor-pointer pb-5"
              title={session.value?.user?.name ?? "User"}
              onClick$={() =>
                (appStore.sidebarCollapsed = !appStore.sidebarCollapsed)
              }
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="size-6"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                />
              </svg>
            </div>
          ) : (
            <p>{session.value?.user?.name}</p>
          )}
          <button
            class="w-max text-red-600"
            onClick$={() => signout.submit({ callbackUrl: "/" })}
            type="button"
            title="Sign out"
          >
            {appStore.sidebarCollapsed ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="size-6"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75"
                />
              </svg>
            ) : (
              "Sign out"
            )}
          </button>
        </div>
      </div>
    </aside>
  );
});
