import { Button } from './Button'
import type { Meta, StoryObj } from '@storybook/react'

const meta: Meta<typeof Button> = {
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    disabled: {
      description: `Is the button disabled?`,
      table: { defaultValue: { summary: 'false' } }
    },
    variant: {
      options: ['contained', 'outlined', 'text'],
      control: 'radio',
      table: { defaultValue: { summary: 'text' } }
    },
    size: {
      description: `How large should the button be?`,
      options: ['small', 'medium', 'large'],
      control: 'inline-radio',
      table: {
        type: { summary: `'small' | 'medium' | 'large'` },
        defaultValue: { summary: 'medium' }
      }
    },
    children: {
      name: 'label',
      table: { defaultValue: { summary: '' } }
    },
    ref: { if: { arg: 'parent', exists: true } },
    component: { if: { arg: 'parent', exists: true } }
  }
}

export default meta

type Story = StoryObj<typeof Button>

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args
export const Primary: Story = {
  args: {
    disabled: false,
    variant: 'contained',
    children: 'Button'
  }
}

export const Secondary: Story = {
  args: {
    disabled: false,
    variant: 'outlined',
    children: 'Button'
  }
}

export const Small: Story = {
  args: {
    disabled: false,
    size: 'small',
    children: 'Button'
  }
}

export const Large: Story = {
  args: {
    disabled: false,
    size: 'large',
    children: 'Button'
  }
}
