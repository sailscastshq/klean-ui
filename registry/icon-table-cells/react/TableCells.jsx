import { forwardRef } from "react";

const TableCells = forwardRef(function TableCells(props, ref) {
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
      <rect x="3.75" y="4.25" width="16.5" height="15.5" rx="2" />
      <path d="M3.75 9.5h16.5M3.75 14.75h16.5M9.25 4.25v15.5M14.75 4.25v15.5" />
    </svg>
  );
});

export default TableCells;
