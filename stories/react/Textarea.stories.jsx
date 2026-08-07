import { expect, userEvent, within } from 'storybook/test'
import Textarea from '../../registry/textarea/react/Textarea.jsx'
import { contract } from '../shared/contract.js'

function TextareaExample() {
  return (
    <div className="w-96 max-w-[calc(100vw-2rem)]">
      <label htmlFor="react-internal-note" className="mb-2 block font-medium">
        {contract.textareaLabel}
      </label>
      <Textarea
        id="react-internal-note"
        placeholder="Add context for your team…"
      />
    </div>
  )
}

const meta = {
  title: 'Components/Textarea',
  component: TextareaExample,
  tags: ['autodocs'],
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
