export const contract = Object.freeze({
  buttonLabel: "Continue",
  checkboxLabel: "Send deployment notifications",
  switchLabel: "Enable preview releases",
  radioLegend: "Deployment region",
  radioOptions: ["Frankfurt", "Lagos", "Virginia"],
  inputLabel: "Project name",
  inputError: "A project name is required.",
  textareaLabel: "Internal note",
  popoverId: "framework-popover",
  popoverLabel: "Filters",
  menuId: "framework-menu",
  menuLabel: "Actions",
  menuItems: ["Edit project", "View deployments", "Delete project"],
  dialogId: "framework-dialog",
  dialogLabel: "Delete project",
  dialogTitle: "Delete this project?",
});

export const menuItemClass = [
  "flex w-full cursor-pointer items-center rounded px-3 py-2 text-left text-sm text-gray-700 no-underline outline-none",
  "hover:bg-gray-100 focus:bg-gray-100 focus:text-gray-950",
  "dark:text-gray-200 dark:hover:bg-white/10 dark:focus:bg-white/10 dark:focus:text-white",
].join(" ");
