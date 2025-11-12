import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Card } from './Card';

describe('Card Component', () => {
  it('renders card with children', () => {
    render(<Card>Card content</Card>);
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('renders card with title', () => {
    render(<Card title="Card Title">Content</Card>);
    expect(screen.getByText('Card Title')).toBeInTheDocument();
  });

  it('renders card with title and subtitle', () => {
    render(<Card title="Title" subtitle="Subtitle">Content</Card>);
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Subtitle')).toBeInTheDocument();
  });

  it('renders card with image', () => {
    render(
      <Card image="https://example.com/image.jpg" title="Card with Image">
        Content
      </Card>
    );
    const img = screen.getByAltText('Card with Image');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'https://example.com/image.jpg');
  });

  it('renders image with default alt text when no title provided', () => {
    render(<Card image="https://example.com/image.jpg">Content</Card>);
    expect(screen.getByAltText('Card image')).toBeInTheDocument();
  });

  it('renders card with footer', () => {
    render(
      <Card footer={<button>Action Button</button>}>
        Content
      </Card>
    );
    expect(screen.getByText('Action Button')).toBeInTheDocument();
  });

  it('applies default variant', () => {
    const { container } = render(<Card>Content</Card>);
    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('border', 'border-gray-200');
  });

  it('applies outlined variant', () => {
    const { container } = render(<Card variant="outlined">Content</Card>);
    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('border-2', 'border-gray-300');
  });

  it('applies elevated variant', () => {
    const { container } = render(<Card variant="elevated">Content</Card>);
    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('shadow-md');
  });

  it('renders as button when clickable', () => {
    render(<Card clickable>Content</Card>);
    const card = screen.getByRole('button');
    expect(card).toBeInTheDocument();
    expect(card).toHaveClass('cursor-pointer');
  });

  it('renders as button when onClick is provided', () => {
    const handleClick = vi.fn();
    render(<Card onClick={handleClick}>Content</Card>);
    const card = screen.getByRole('button');
    expect(card).toBeInTheDocument();
  });

  it('handles onClick events', () => {
    const handleClick = vi.fn();
    render(<Card onClick={handleClick}>Content</Card>);
    const card = screen.getByRole('button');
    fireEvent.click(card);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('handles onClick events when clickable prop is true', () => {
    const handleClick = vi.fn();
    render(<Card clickable onClick={handleClick}>Content</Card>);
    const card = screen.getByRole('button');
    fireEvent.click(card);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies custom className', () => {
    const { container } = render(<Card className="custom-card">Content</Card>);
    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('custom-card');
  });

  it('applies base styles to all variants', () => {
    const { container } = render(<Card>Content</Card>);
    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('rounded-lg', 'overflow-hidden', 'bg-white');
  });

  it('renders card with all sections together', () => {
    render(
      <Card
        title="Complete Card"
        subtitle="With all sections"
        image="https://example.com/image.jpg"
        footer={<div>Footer content</div>}
      >
        Body content
      </Card>
    );
    expect(screen.getByText('Complete Card')).toBeInTheDocument();
    expect(screen.getByText('With all sections')).toBeInTheDocument();
    expect(screen.getByAltText('Complete Card')).toBeInTheDocument();
    expect(screen.getByText('Body content')).toBeInTheDocument();
    expect(screen.getByText('Footer content')).toBeInTheDocument();
  });

  it('has proper accessibility attributes when clickable', () => {
    render(<Card clickable>Content</Card>);
    const card = screen.getByRole('button');
    expect(card).toHaveAttribute('tabIndex', '0');
  });

  it('renders as div when not clickable', () => {
    const { container } = render(<Card>Content</Card>);
    const card = container.firstChild as HTMLElement;
    expect(card.tagName).toBe('DIV');
    expect(card).not.toHaveAttribute('role');
    expect(card).not.toHaveClass('cursor-pointer');
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();
    render(<Card ref={ref}>Content</Card>);
    expect(ref).toHaveBeenCalled();
  });
});
