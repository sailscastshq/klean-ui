import { forwardRef } from "react";

const Tag = forwardRef(function Tag(props, ref) {
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
      <path d="M4.25 4.25h7l8.5 8.5-7 7-8.5-8.5z" />
      <circle cx="8.25" cy="8.25" r="1.25" />
    </svg>
  );
});

export default Tag;
