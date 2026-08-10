import { expect, userEvent, within } from 'storybook/test'
import MenuExample from './MenuExample.svelte'
import { contract } from '../shared/contract.js'

const meta = {
  title: 'Components/Menu',
  component: MenuExample,
  parameters: { layout: 'centered', controls: { disable: true } },
}

export default meta

export const KeyboardContract = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const trigger = canvas.getByRole('button', { name: contract.menuLabel })

    trigger.focus()
    await userEvent.keyboard('{ArrowDown}')
    await expect(
      canvas.getByRole('menuitem', { name: contract.menuItems[0] })
    ).toHaveFocus()
    await userEvent.keyboard('{ArrowDown}')
    await expect(
      canvas.getByRole('menuitem', { name: contract.menuItems[1] })
    ).toHaveFocus()
    await userEvent.keyboard('{Escape}')
    await expect(trigger).toHaveFocus()
  },
}
