import { forwardRef } from "react";

const History = forwardRef(function History(props, ref) {
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
      <path d="M4.5 8V4.5H8" />
      <path d="M5 6.25A8.25 8.25 0 1 1 4.15 15" />
      <path d="M12 7.75v4.5l3 1.75" />
    </svg>
  );
});

export default History;
