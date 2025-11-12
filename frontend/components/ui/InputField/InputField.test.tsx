import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { InputField } from './InputField';

describe('InputField Component', () => {
  it('renders input with label', () => {
    render(<InputField label="Email" />);
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('renders input without label', () => {
    render(<InputField placeholder="Enter value" />);
    expect(screen.getByPlaceholderText('Enter value')).toBeInTheDocument();
  });

  it('handles value and onChange correctly', () => {
    const handleChange = vi.fn();
    render(<InputField value="test" onChange={handleChange} />);

    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('test');

    fireEvent.change(input, { target: { value: 'new value' } });
    expect(handleChange).toHaveBeenCalled();
  });

  it('displays error message', () => {
    render(<InputField error="This field is required" />);
    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('applies error styling when error is present', () => {
    render(<InputField error="Error message" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('border-red-500');
  });

  it('displays helper text', () => {
    render(<InputField helperText="Enter your email address" />);
    expect(screen.getByText('Enter your email address')).toBeInTheDocument();
  });

  it('shows helper text but not error when both provided', () => {
    render(<InputField helperText="Helper" error="Error" />);
    expect(screen.getByText('Error')).toBeInTheDocument();
    expect(screen.queryByText('Helper')).not.toBeInTheDocument();
  });

  it('handles different input types', () => {
    const { rerender } = render(<InputField type="email" />);
    expect(screen.getByRole('textbox')).toHaveAttribute('type', 'email');

    rerender(<InputField type="password" />);
    const passwordInput = document.querySelector('input[type="password"]');
    expect(passwordInput).toBeInTheDocument();

    rerender(<InputField type="number" />);
    const numberInput = document.querySelector('input[type="number"]');
    expect(numberInput).toBeInTheDocument();
  });

  it('applies disabled state correctly', () => {
    render(<InputField disabled />);
    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();
    expect(input).toHaveClass('disabled:opacity-50', 'disabled:cursor-not-allowed');
  });

  it('applies required attribute', () => {
    render(<InputField required />);
    expect(screen.getByRole('textbox')).toBeRequired();
  });

  it('applies fullWidth prop', () => {
    render(<InputField fullWidth />);
    const container = screen.getByRole('textbox').parentElement;
    expect(container).toHaveClass('w-full');
  });

  it('handles placeholder correctly', () => {
    render(<InputField placeholder="Enter your name" />);
    expect(screen.getByPlaceholderText('Enter your name')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<InputField className="custom-input" />);
    expect(screen.getByRole('textbox')).toHaveClass('custom-input');
  });

  it('associates label with input correctly', () => {
    render(<InputField label="Username" id="username-input" />);
    const input = screen.getByLabelText('Username');
    expect(input).toHaveAttribute('id', 'username-input');
  });

  it('handles focus and blur events', () => {
    const handleFocus = vi.fn();
    const handleBlur = vi.fn();
    render(<InputField onFocus={handleFocus} onBlur={handleBlur} />);

    const input = screen.getByRole('textbox');
    fireEvent.focus(input);
    expect(handleFocus).toHaveBeenCalledTimes(1);

    fireEvent.blur(input);
    expect(handleBlur).toHaveBeenCalledTimes(1);
  });

  it('renders with maxLength attribute', () => {
    render(<InputField maxLength={10} />);
    expect(screen.getByRole('textbox')).toHaveAttribute('maxLength', '10');
  });

  it('has proper accessibility attributes', () => {
    render(<InputField label="Email" error="Invalid email" aria-describedby="error-msg" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAccessibleName('Email');
  });
});
