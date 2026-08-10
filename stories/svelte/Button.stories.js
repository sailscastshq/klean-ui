import { expect, fn, userEvent, within } from 'storybook/test'
import ButtonExample from './ButtonExample.svelte'
import { contract } from '../shared/contract.js'

const meta = {
  title: 'Components/Button',
  component: ButtonExample,
  parameters: { layout: 'centered' },
  args: {
    label: contract.buttonLabel,
    disabled: false,
    onclick: fn(),
  },
  argTypes: {
    label: { control: 'text' },
    disabled: { control: 'boolean' },
    onclick: { table: { disable: true } },
  },
}

export default meta

export const Playground = {
  play: async ({ args, canvasElement }) => {
    const button = within(canvasElement).getByRole('button', {
      name: args.label,
    })
    await expect(button).toHaveAttribute('type', 'button')
    if (!args.disabled) {
      await userEvent.click(button)
      await expect(args.onclick).toHaveBeenCalled()
    }
  },
}
