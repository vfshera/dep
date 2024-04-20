import { type QwikIntrinsicElements, component$ } from "@builder.io/qwik";

type InputProps = QwikIntrinsicElements["input"] & {
  label?: string | boolean;
};

export default component$<InputProps>(
  ({
    label,
    class: classes = "py-1 px-2 border border-gray-700",
    ...props
  }) => {
    return (
      <div class="input-field space-y-1">
        {label && props.name && (
          <label>{typeof label === "string" ? label : props.name}</label>
        )}

        <input class={["w-full rounded", classes]} {...props} />
      </div>
    );
  },
);
