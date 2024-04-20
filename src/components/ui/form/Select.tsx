import { type QwikIntrinsicElements, component$ } from "@builder.io/qwik";
type SelectProps = QwikIntrinsicElements["select"] & {
  defaultOption?: string | boolean;
  items: string[] | { name: string; value: string }[];
};
export default component$<SelectProps>(
  ({ items, class: classes, defaultOption, ...props }) => {
    const options = items.map((i) => {
      if (typeof i === "string") {
        return { name: i, value: i };
      } else {
        return i;
      }
    });

    return (
      <select {...props} class={["w-full bg-transparent py-1", classes]}>
        {defaultOption && (
          <option value="" disabled>
            {typeof defaultOption === "string" ? defaultOption : "choose"}
          </option>
        )}
        {options.map((opt, i) => (
          <option value={opt.value} key={`${i}-${opt.value}`}>
            {opt.name}
          </option>
        ))}
      </select>
    );
  },
);
