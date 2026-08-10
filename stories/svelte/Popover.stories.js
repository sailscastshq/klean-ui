import { expect, userEvent, within } from 'storybook/test'
import PopoverExample from './PopoverExample.svelte'
import { contract } from '../shared/contract.js'

const meta = {
  title: 'Components/Popover',
  component: PopoverExample,
  parameters: { layout: 'centered', controls: { disable: true } },
}

export default meta

export const NativeInteraction = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const trigger = canvas.getByRole('button', { name: contract.popoverLabel })
    const popover = canvasElement.querySelector(`#${contract.popoverId}`)

    await userEvent.click(trigger)
    await expect(popover).toHaveAttribute('data-state', 'open')
    await expect(popover.style.left).toMatch(/px$/)
    await expect(popover.style.top).toMatch(/px$/)
    await userEvent.keyboard('{Escape}')
    await expect(popover).toHaveAttribute('data-state', 'closed')
    await expect(trigger).toHaveFocus()
  },
}
