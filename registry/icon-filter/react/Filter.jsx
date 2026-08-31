import { forwardRef } from "react";

const Filter = forwardRef(function Filter(props, ref) {
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
      <path d="M3.75 5h16.5l-6.5 7.25v6.25l-3.5 1.75v-8z" />
    </svg>
  );
});

export default Filter;
