import { component$ } from "@builder.io/qwik";
import { Link } from "@builder.io/qwik-city";
import GlowCard from "~/components/ui/react/GlowCard";

import scripts from "~/scripts";

export default component$(() => {
  return (
    <div class="flex flex-col gap-5 p-5">
      <h2>Deployment Templates</h2>

      <ul class="grid grid-cols-4">
        {scripts.map((s) => (
          <li key={s.id} class="min-h-[16rem]">
            <Link href={`/dashboard/${s.id}`} class="block h-full w-full">
              <GlowCard
                title={s.name}
                description={s.description}
                client:idle
              />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
});
