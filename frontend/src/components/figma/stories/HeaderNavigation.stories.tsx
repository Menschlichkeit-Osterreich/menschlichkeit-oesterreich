import type { Meta, StoryObj } from '@storybook/react';
import { HeaderNavigation } from '../HeaderNavigation';

const meta: Meta<typeof HeaderNavigation> = {
  title: 'Figma/HeaderNavigation',
  component: HeaderNavigation,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/mTlUSy9BQk4326cvwNa8zQ/Website?node-id=1:1'
    }
  },
  argTypes: {
    className: {
      control: 'text',
      description: 'Additional CSS classes'
    }
  }
};

export default meta;
type Story = StoryObj<typeof HeaderNavigation>;

export const Default: Story = {
  args: {
    children: 'Content goes here'
  }
};

export const WithCustomClass: Story = {
  args: {
    className: 'bg-primary-50 p-8',
    children: 'Custom styled content'
  }
};
