import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Modal } from './Modal';

describe('Modal Component', () => {
  it('renders modal when isOpen is true', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="Test Modal">
        <div>Modal Content</div>
      </Modal>
    );

    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    expect(screen.getByText('Modal Content')).toBeInTheDocument();
  });

  it('does not render modal when isOpen is false', () => {
    render(
      <Modal isOpen={false} onClose={() => {}} title="Test Modal">
        <div>Modal Content</div>
      </Modal>
    );

    expect(screen.queryByText('Test Modal')).not.toBeInTheDocument();
    expect(screen.queryByText('Modal Content')).not.toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const handleClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={handleClose} title="Test Modal">
        Content
      </Modal>
    );

    const closeButton = screen.getByLabelText('Close modal');
    fireEvent.click(closeButton);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when backdrop is clicked', () => {
    const handleClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={handleClose} title="Test Modal">
        Content
      </Modal>
    );

    // Click on the backdrop (the div with aria-hidden="true")
    const dialog = screen.getByRole('dialog');
    const backdrop = dialog.querySelector('[aria-hidden="true"]') as HTMLElement;
    fireEvent.click(backdrop);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('does not close when content is clicked', () => {
    const handleClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={handleClose} title="Test Modal">
        Content
      </Modal>
    );

    const content = screen.getByText('Content');
    fireEvent.click(content);

    expect(handleClose).not.toHaveBeenCalled();
  });

  it('closes modal on Escape key press', () => {
    const handleClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={handleClose} title="Test Modal">
        Content
      </Modal>
    );

    fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('does not close on other key press', () => {
    const handleClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={handleClose} title="Test Modal">
        Content
      </Modal>
    );

    fireEvent.keyDown(document, { key: 'Enter', code: 'Enter' });

    expect(handleClose).not.toHaveBeenCalled();
  });

  it('applies different sizes correctly', () => {
    const { rerender, container } = render(
      <Modal isOpen={true} onClose={() => {}} title="Small Modal" size="sm">
        Content
      </Modal>
    );

    let modalContent = container.querySelector('.max-w-sm');
    expect(modalContent).toBeInTheDocument();

    rerender(
      <Modal isOpen={true} onClose={() => {}} title="Medium Modal" size="md">
        Content
      </Modal>
    );

    modalContent = container.querySelector('.max-w-md');
    expect(modalContent).toBeInTheDocument();

    rerender(
      <Modal isOpen={true} onClose={() => {}} title="Large Modal" size="lg">
        Content
      </Modal>
    );

    modalContent = container.querySelector('.max-w-lg');
    expect(modalContent).toBeInTheDocument();
  });

  it('renders footer when provided', () => {
    render(
      <Modal
        isOpen={true}
        onClose={() => {}}
        title="Modal with Footer"
        footer={<div>Footer Content</div>}
      >
        Content
      </Modal>
    );

    expect(screen.getByText('Footer Content')).toBeInTheDocument();
  });

  it('respects closeOnBackdrop prop', () => {
    const handleClose = vi.fn();
    render(
      <Modal
        isOpen={true}
        onClose={handleClose}
        title="No Backdrop Close"
        closeOnBackdrop={false}
      >
        Content
      </Modal>
    );

    // Click on the backdrop
    const dialog = screen.getByRole('dialog');
    const backdrop = dialog.querySelector('[aria-hidden="true"]') as HTMLElement;
    fireEvent.click(backdrop);

    // Should not close when closeOnBackdrop is false
    expect(handleClose).not.toHaveBeenCalled();
  });

  it('has proper ARIA attributes', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="Accessible Modal">
        Content
      </Modal>
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby');
  });
});
