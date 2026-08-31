import { forwardRef } from "react";

const Bookmark = forwardRef(function Bookmark(props, ref) {
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
      <path d="M7 4.25h10v16l-5-3.5-5 3.5z" />
    </svg>
  );
});

export default Bookmark;
