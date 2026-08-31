import { forwardRef } from "react";

const Server = forwardRef(function Server(props, ref) {
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
      <rect x="3.75" y="3.75" width="16.5" height="6.75" rx="2.25" />
      <rect x="3.75" y="13.5" width="16.5" height="6.75" rx="2.25" />
      <path d="M7.25 7.15h.01M10 7.15h5.75M7.25 16.9h.01M10 16.9h5.75" />
    </svg>
  );
});

export default Server;
