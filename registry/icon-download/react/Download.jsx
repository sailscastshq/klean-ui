import { forwardRef } from "react";

const Download = forwardRef(function Download(props, ref) {
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
      <path d="M12 4.25v10.5m-4-4 4 4 4-4" />
      <path d="M4.5 16.75v3h15v-3" />
    </svg>
  );
});

export default Download;
