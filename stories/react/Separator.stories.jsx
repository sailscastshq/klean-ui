import Separator from "../../registry/separator/react/Separator.jsx";

function SeparatorExample({ orientation, className }) {
  return (
    <div
      className={
        orientation === "vertical"
          ? "flex h-32 items-stretch"
          : "w-[min(80vw,28rem)]"
      }
    >
      <Separator orientation={orientation} className={className} />
    </div>
  );
}

const meta = {
  title: "Components/Separator",
  component: SeparatorExample,
  parameters: { layout: "centered" },
  args: { orientation: "horizontal", className: "" },
  argTypes: {
    orientation: {
      control: "inline-radio",
      options: ["horizontal", "vertical"],
    },
    className: { control: "text" },
  },
};

export default meta;

export const Playground = {};

export const Boundaries = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="w-[min(88vw,32rem)] rounded-xl bg-white p-6 shadow-sm dark:bg-gray-950">
      <section aria-labelledby="react-profile-title">
        <h2 id="react-profile-title" className="font-semibold">
          Profile
        </h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
          Personal account details.
        </p>
      </section>
      <Separator className="my-6" />
      <section aria-labelledby="react-security-title">
        <h2 id="react-security-title" className="font-semibold">
          Security
        </h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
          Sign-in and recovery settings.
        </p>
      </section>
    </div>
  ),
};
