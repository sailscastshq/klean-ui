import { forwardRef } from "react";

const ArrowUp = forwardRef(function ArrowUp(props, ref) {
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
      <path d="M12 19.5v-14" />
      <path d="m6.75 10.75 5.25-5.25 5.25 5.25" />
    </svg>
  );
});

export default ArrowUp;
