import { forwardRef } from "react";

const Wrench = forwardRef(function Wrench(props, ref) {
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
      <path d="M14.25 5.25a4.5 4.5 0 0 0-5.5 5.5l-4.5 4.5a2.65 2.65 0 0 0 3.75 3.75l4.5-4.5a4.5 4.5 0 0 0 5.5-5.5l-2.75 2.75-3-3z" />
      <path d="M6.25 17h.01" strokeWidth="2" />
    </svg>
  );
});

export default Wrench;
