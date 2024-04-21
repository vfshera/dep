import { component$ } from "@builder.io/qwik";
import { Link } from "@builder.io/qwik-city";
import { useAuthSession } from "../plugin@auth";

export default component$(() => {
  const session = useAuthSession();

  return (
    <header class="sticky top-0 z-50 flex h-12 items-center justify-between border-b bg-white px-5">
      <Link href="/dashboard" class="text-xl font-bold tracking-tight">
        Dashboard
      </Link>

      <div>
        <p>{session.value?.user?.name}</p>
      </div>
    </header>
  );
});
