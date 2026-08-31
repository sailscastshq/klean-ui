import { forwardRef } from "react";

const DocumentAdd = forwardRef(function DocumentAdd(props, ref) {
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
      <path d="M6 3.75h7l5 5v11.5H6zM13 3.75v5h5" />
      <path d="M12 12v5M9.5 14.5h5" />
    </svg>
  );
});

export default DocumentAdd;
