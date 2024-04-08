import { component$, useSignal } from "@builder.io/qwik";
import { Link } from "@builder.io/qwik-city";

export default component$(() => {
  const links = useSignal([
    {
      name: "Link",
      href: "#",
    },
    {
      name: "Link 2",
      href: "#",
    },
    {
      name: "Link 3",
      href: "#",
    },
  ]);
  return (
    <header class="flex h-12 items-center justify-between border-b px-5">
      <Link href="/dashboard" class="text-xl font-bold tracking-tight">
        Dashboard
      </Link>
      <ul class="flex items-center gap-6">
        {links.value.map((link, index) => (
          <li key={index}>
            <a href={link.href} class="text-sm">
              {link.name}
            </a>
          </li>
        ))}
      </ul>
    </header>
  );
});
