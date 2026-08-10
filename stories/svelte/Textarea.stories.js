import { expect, userEvent, within } from 'storybook/test'
import TextareaExample from './TextareaExample.svelte'
import { contract } from '../shared/contract.js'

const meta = {
  title: 'Components/Textarea',
  component: TextareaExample,
  parameters: { layout: 'centered', controls: { disable: true } },
}

export default meta

export const AutoGrow = {
  play: async ({ canvasElement }) => {
    const textarea = within(canvasElement).getByLabelText(contract.textareaLabel)
    await userEvent.type(textarea, 'First line{enter}Second line{enter}Third line')
    await expect(textarea).toHaveValue('First line\nSecond line\nThird line')
    await expect(textarea.style.getPropertyValue('--klean-textarea-height')).toMatch(
      /px$/
    )
  },
}
