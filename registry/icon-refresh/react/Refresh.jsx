import { forwardRef } from "react";

const Refresh = forwardRef(function Refresh(props, ref) {
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
      <path d="M19.5 8.5V4.75h-3.75M4.5 15.5v3.75h3.75" />
      <path d="M18.65 7A8 8 0 0 0 5.5 7.25M5.35 17A8 8 0 0 0 18.5 16.75" />
    </svg>
  );
});

export default Refresh;
