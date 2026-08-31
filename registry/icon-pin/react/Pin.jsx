import { forwardRef } from "react";

const Pin = forwardRef(function Pin(props, ref) {
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
      <path d="M8 4.25h8l-1 5 2.75 2.75v1.5H6.25V12L9 9.25z" />
      <path d="M12 13.5v7.25" />
    </svg>
  );
});

export default Pin;
