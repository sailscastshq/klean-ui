import { forwardRef } from "react";

const CalendarX = forwardRef(function CalendarX(props, ref) {
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
      <rect x="3.75" y="5.5" width="16.5" height="14.25" rx="2.25" />
      <path d="M8 3.75v3.5M16 3.75v3.5M3.75 9.5h16.5M9.25 13l5.5 5M14.75 13l-5.5 5" />
    </svg>
  );
});

export default CalendarX;
