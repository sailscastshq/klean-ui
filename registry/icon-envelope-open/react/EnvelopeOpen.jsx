import { forwardRef } from "react";

const EnvelopeOpen = forwardRef(function EnvelopeOpen(props, ref) {
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
      <path d="m4.25 10.5 7.75-6 7.75 6v9.25H4.25z" />
      <path d="M7 10.25V6.75h10v3.5M4.5 10.75l7.5 5.5 7.5-5.5M4.75 19.25 10 14.8M19.25 19.25 14 14.8" />
    </svg>
  );
});

export default EnvelopeOpen;
