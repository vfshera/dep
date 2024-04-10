import { component$ } from "@builder.io/qwik";

export default component$<{ errors?: string[] }>(({ errors }) => {
  if (!errors) return <></>;

  return (
    <div class="text-red-500">
      {errors.map((e) => (
        <small key={e}> {e}</small>
      ))}
    </div>
  );
});
