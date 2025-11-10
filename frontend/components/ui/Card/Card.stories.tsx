import type { Meta, StoryObj } from '@storybook/react';
import { Card } from './Card';
import { Button } from '../Button';

const meta = {
  title: 'UI/Card',
  component: Card,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: <p>This is a basic card with default styling.</p>,
  },
};

export const WithTitle: Story = {
  args: {
    title: 'Card Title',
    children: <p>Card content goes here.</p>,
  },
};

export const WithSubtitle: Story = {
  args: {
    title: 'Card Title',
    subtitle: 'Card subtitle for additional context',
    children: <p>Card content with both title and subtitle.</p>,
  },
};

export const WithImage: Story = {
  args: {
    image: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=400',
    title: 'Beautiful Landscape',
    children: <p>A card with a header image.</p>,
  },
};

export const WithFooter: Story = {
  args: {
    title: 'Product Card',
    children: <p>This product is amazing!</p>,
    footer: (
      <div className="flex gap-2">
        <Button size="sm">Buy Now</Button>
        <Button variant="outline" size="sm">
          Learn More
        </Button>
      </div>
    ),
  },
};

export const Outlined: Story = {
  args: {
    variant: 'outlined',
    title: 'Outlined Card',
    children: <p>This card has an outlined border.</p>,
  },
};

export const Elevated: Story = {
  args: {
    variant: 'elevated',
    title: 'Elevated Card',
    children: <p>This card has a shadow for elevation.</p>,
  },
};

export const Clickable: Story = {
  args: {
    title: 'Clickable Card',
    clickable: true,
    onClick: () => alert('Card clicked!'),
    children: <p>Click anywhere on this card to trigger an action.</p>,
  },
};

export const FullExample: Story = {
  args: {
    variant: 'elevated',
    image: 'https://images.unsplash.com/photo-1522770179533-24471fcdba45?w=400',
    title: 'Premium Course',
    subtitle: 'Learn modern web development',
    children: (
      <div>
        <p className="mb-2">
          Master React, Next.js, and TypeScript in this comprehensive course.
        </p>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>⭐ 4.9</span>
          <span>•</span>
          <span>1,234 students</span>
        </div>
      </div>
    ),
    footer: (
      <div className="flex justify-between items-center">
        <span className="text-lg font-bold">$49.99</span>
        <Button size="sm">Enroll Now</Button>
      </div>
    ),
  },
};
