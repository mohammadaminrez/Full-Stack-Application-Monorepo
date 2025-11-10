import type { Meta, StoryObj } from '@storybook/react';
import { Tabs } from './Tabs';

const meta = {
  title: 'UI/Tabs',
  component: Tabs,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleTabs = [
  {
    id: 'profile',
    label: 'Profile',
    content: (
      <div>
        <h3 className="text-lg font-semibold mb-2">User Profile</h3>
        <p>Manage your profile information and settings.</p>
      </div>
    ),
  },
  {
    id: 'settings',
    label: 'Settings',
    content: (
      <div>
        <h3 className="text-lg font-semibold mb-2">Settings</h3>
        <p>Configure your account preferences and privacy settings.</p>
      </div>
    ),
  },
  {
    id: 'notifications',
    label: 'Notifications',
    content: (
      <div>
        <h3 className="text-lg font-semibold mb-2">Notifications</h3>
        <p>Control how and when you receive notifications.</p>
      </div>
    ),
  },
];

export const Underline: Story = {
  args: {
    tabs: sampleTabs,
    variant: 'underline',
  },
};

export const Pills: Story = {
  args: {
    tabs: sampleTabs,
    variant: 'pills',
  },
};

export const WithDisabledTab: Story = {
  args: {
    tabs: [
      ...sampleTabs,
      {
        id: 'disabled',
        label: 'Disabled',
        content: <p>This tab is disabled</p>,
        disabled: true,
      },
    ],
    variant: 'underline',
  },
};

export const FullWidth: Story = {
  args: {
    tabs: sampleTabs,
    variant: 'pills',
    fullWidth: true,
  },
};

export const DefaultSelected: Story = {
  args: {
    tabs: sampleTabs,
    defaultTab: 'settings',
    variant: 'underline',
  },
};
