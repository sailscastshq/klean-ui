import { forwardRef } from "react";

const Image = forwardRef(function Image(props, ref) {
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
      <rect x="3.75" y="4.25" width="16.5" height="15.5" rx="2.25" />
      <circle cx="8.25" cy="8.75" r="1.5" />
      <path d="m4.5 17 4.5-4.25 3 2.5 3-3 4.5 4.75" />
    </svg>
  );
});

export default Image;
