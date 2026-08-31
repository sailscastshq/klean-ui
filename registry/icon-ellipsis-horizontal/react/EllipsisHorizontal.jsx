import { forwardRef } from "react";

const EllipsisHorizontal = forwardRef(function EllipsisHorizontal(props, ref) {
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
      <path d="M6.25 12h.01M12 12h.01M17.75 12h.01" strokeWidth="2.25" />
    </svg>
  );
});

export default EllipsisHorizontal;
