import { forwardRef } from "react";

const Send = forwardRef(function Send(props, ref) {
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
      <path d="m3.75 5 16.5-1.25-7 16.5-2.25-7z" />
      <path d="m11 13.25 9.25-9.5M11 13.25l-.5 5" />
    </svg>
  );
});

export default Send;
