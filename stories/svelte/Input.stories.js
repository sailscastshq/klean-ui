import { expect, userEvent, within } from 'storybook/test'
import InputExample from './InputExample.svelte'
import { contract } from '../shared/contract.js'

const meta = {
  title: 'Components/Input',
  component: InputExample,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  args: { invalid: false },
  argTypes: { invalid: { control: 'boolean' } },
}

export default meta

export const Playground = {
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByLabelText(contract.inputLabel)
    await userEvent.type(input, 'Slipway')
    await expect(input).toHaveValue('Slipway')
  },
}
