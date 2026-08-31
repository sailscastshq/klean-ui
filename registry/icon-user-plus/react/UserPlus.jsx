import { forwardRef } from "react";

const UserPlus = forwardRef(function UserPlus(props, ref) {
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
      <circle cx="9" cy="8.25" r="3.25" />
      <path d="M3.75 19.75c.35-3.9 2.1-5.75 5.25-5.75 2.2 0 3.7.9 4.55 2.75M17.5 9v6M14.5 12h6" />
    </svg>
  );
});

export default UserPlus;
