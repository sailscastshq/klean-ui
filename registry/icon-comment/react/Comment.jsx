import { forwardRef } from "react";

const Comment = forwardRef(function Comment(props, ref) {
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
      <path d="M4.25 5.25h15.5v11.5H10l-4.75 3v-3H4.25z" />
      <path d="M8 9.25h8M8 12.75h5.5" />
    </svg>
  );
});

export default Comment;
