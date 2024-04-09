import { component$ } from "@builder.io/qwik";
import { Link } from "@builder.io/qwik-city";
import { useAuthSession } from "../plugin@auth";

export default component$(() => {
  const session = useAuthSession();
  return (
    <header class="flex h-12 items-center justify-between border-b px-5">
      <Link href="/dashboard" class="text-xl font-bold tracking-tight">
        Dashboard
      </Link>

      <div>
        <p>{session.value?.user?.name}</p>
      </div>
    </header>
  );
});
