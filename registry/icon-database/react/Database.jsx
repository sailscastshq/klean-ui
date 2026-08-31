import { forwardRef } from "react";

const Database = forwardRef(function Database(props, ref) {
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
      <ellipse cx="12" cy="6.25" rx="7.5" ry="2.75" />
      <path d="M4.5 6.25v5.75c0 1.5 3.35 2.75 7.5 2.75s7.5-1.25 7.5-2.75V6.25M4.5 12v5.75c0 1.5 3.35 2.75 7.5 2.75s7.5-1.25 7.5-2.75V12" />
    </svg>
  );
});

export default Database;
