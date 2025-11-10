import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Modal } from './Modal';
import { Button } from '../Button';

const meta = {
  title: 'UI/Modal',
  component: Modal,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof meta>;

// Wrapper component to handle state
function ModalWithState(props: any) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Open Modal</Button>
      <Modal {...props} isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}

export const Default: Story = {
  render: () => (
    <ModalWithState title="Default Modal">
      <p>This is a modal with default size and settings.</p>
    </ModalWithState>
  ),
};

export const Small: Story = {
  render: () => (
    <ModalWithState title="Small Modal" size="sm">
      <p>This is a small modal.</p>
    </ModalWithState>
  ),
};

export const Large: Story = {
  render: () => (
    <ModalWithState title="Large Modal" size="lg">
      <p>This is a large modal with more space for content.</p>
    </ModalWithState>
  ),
};

export const WithFooter: Story = {
  render: () => (
    <ModalWithState
      title="Modal with Footer"
      footer={
        <>
          <Button variant="outline" onClick={() => {}}>
            Cancel
          </Button>
          <Button onClick={() => {}}>Confirm</Button>
        </>
      }
    >
      <p>This modal has action buttons in the footer.</p>
    </ModalWithState>
  ),
};

export const NoBackdropClose: Story = {
  render: () => (
    <ModalWithState title="No Backdrop Close" closeOnBackdrop={false}>
      <p>Clicking the backdrop won&apos;t close this modal. Use the X button or ESC key.</p>
    </ModalWithState>
  ),
};
