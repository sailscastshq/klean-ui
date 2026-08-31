import { forwardRef } from "react";

const Cube = forwardRef(function Cube(props, ref) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      data-slot="icon"
      {...props}
      ref={ref}
    >
      <path d="m12 3.75 7.25 4.1v8.3L12 20.25l-7.25-4.1v-8.3z" />
      <path d="m4.75 7.85 7.25 4.1 7.25-4.1M12 11.95v8.3" />
    </svg>
  );
});

export default Cube;
