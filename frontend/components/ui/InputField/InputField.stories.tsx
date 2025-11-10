import type { Meta, StoryObj } from '@storybook/react';
import { InputField } from './InputField';

const meta = {
  title: 'UI/InputField',
  component: InputField,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'tel', 'url'],
    },
  },
} satisfies Meta<typeof InputField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: 'Enter text...',
  },
};

export const WithLabel: Story = {
  args: {
    label: 'Full Name',
    placeholder: 'John Doe',
  },
};

export const Required: Story = {
  args: {
    label: 'Email',
    type: 'email',
    placeholder: 'john@example.com',
    required: true,
  },
};

export const WithError: Story = {
  args: {
    label: 'Password',
    type: 'password',
    placeholder: '••••••••',
    error: 'Password must be at least 8 characters',
  },
};

export const WithHelperText: Story = {
  args: {
    label: 'Username',
    placeholder: 'johndoe',
    helperText: 'Choose a unique username (letters and numbers only)',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Disabled Field',
    placeholder: 'Cannot edit',
    disabled: true,
    value: 'This field is disabled',
  },
};

export const FullWidth: Story = {
  args: {
    label: 'Full Width Input',
    placeholder: 'Spans full width',
    fullWidth: true,
  },
  parameters: {
    layout: 'padded',
  },
};

export const Email: Story = {
  args: {
    label: 'Email Address',
    type: 'email',
    placeholder: 'your.email@example.com',
    helperText: 'We will never share your email',
  },
};

export const Password: Story = {
  args: {
    label: 'Password',
    type: 'password',
    placeholder: '••••••••',
    helperText: 'Minimum 8 characters',
  },
};
