import type { Meta, StoryObj } from '@storybook/react';
import { Footer } from '../Footer';

const meta: Meta<typeof Footer> = {
  title: 'Figma/Footer',
  component: Footer,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/mTlUSy9BQk4326cvwNa8zQ/Website?node-id=1:5'
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
type Story = StoryObj<typeof Footer>;

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
