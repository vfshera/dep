import { component$, useSignal } from "@builder.io/qwik";

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
      <h1 class="text-xl font-bold tracking-tight">Dashboard</h1>
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
