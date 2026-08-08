import { expect, userEvent, within } from "storybook/test";
import Button from "../../registry/button/react/Button.jsx";
import Menu from "../../registry/menu/react/Menu.jsx";
import { contract, menuItemClass } from "../shared/contract.js";

function MenuExample() {
  return (
    <div>
      <Button popoverTarget={contract.menuId}>{contract.menuLabel}</Button>
      <Menu id={contract.menuId} aria-label="Project actions" className="w-56">
        <button type="button" className={menuItemClass}>
          {contract.menuItems[0]}
        </button>
        <a href="#react-menu" className={menuItemClass}>
          {contract.menuItems[1]}
        </a>
        <button
          type="button"
          className={`${menuItemClass} text-red-700 hover:bg-red-50 focus:bg-red-50`}
        >
          {contract.menuItems[2]}
        </button>
      </Menu>
    </div>
  );
}

const meta = {
  title: "Components/Menu",
  component: MenuExample,
  tags: ["autodocs"],
  parameters: { layout: "centered", controls: { disable: true } },
};

export default meta;

export const KeyboardContract = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: contract.menuLabel });

    trigger.focus();
    await userEvent.keyboard("{ArrowDown}");
    await expect(
      canvas.getByRole("menuitem", { name: contract.menuItems[0] }),
    ).toHaveFocus();
    await userEvent.keyboard("{ArrowDown}");
    await expect(
      canvas.getByRole("menuitem", { name: contract.menuItems[1] }),
    ).toHaveFocus();
    await userEvent.keyboard("{Escape}");
    await expect(trigger).toHaveFocus();
  },
};
