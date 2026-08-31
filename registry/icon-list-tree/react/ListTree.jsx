import { forwardRef } from "react";

const ListTree = forwardRef(function ListTree(props, ref) {
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
      <circle cx="6" cy="5.75" r="1.5" />
      <circle cx="11" cy="12" r="1.25" />
      <circle cx="11" cy="18.25" r="1.25" />
      <path d="M6 7.25v11h3.75M6 12h3.75M13.25 12h6M13.25 18.25h6" />
    </svg>
  );
});

export default ListTree;
