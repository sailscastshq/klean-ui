import { expect, userEvent, within } from 'storybook/test'
import SelectExample from './SelectExample.svelte'

const meta = {
  title: 'Components/Select',
  component: SelectExample,
  tags: ['autodocs'],
  parameters: { layout: 'centered', controls: { disable: true } },
}

export default meta

export const KeyboardContract = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const trigger = canvas.getByRole('combobox', { name: 'Member role' })

    trigger.focus()
    await userEvent.keyboard('{ArrowDown}{ArrowDown}')
    await expect(trigger).toHaveTextContent('Viewer')
    await userEvent.keyboard('{Enter}')
    await expect(trigger).toHaveTextContent('Administrator')
    await expect(trigger).toHaveFocus()
  },
}
