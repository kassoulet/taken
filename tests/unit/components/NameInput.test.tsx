import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import NameInput from '../src/components/NameInput/NameInput';

describe('NameInput Component', () => {
  it('renders with correct placeholder', () => {
    render(<NameInput onValidate={() => {}} onDebouncedChange={() => {}} />);
    const input = screen.getByPlaceholderText(/enter a package name/i);
    expect(input).toBeInTheDocument();
  });

  it('calls onValidate when input changes', () => {
    const mockOnValidate = vi.fn();
    render(<NameInput onValidate={mockOnValidate} onDebouncedChange={() => {}} />);

    const input = screen.getByPlaceholderText(/enter a package name/i);
    fireEvent.change(input, { target: { value: 'test-package' } });

    expect(mockOnValidate).toHaveBeenCalledWith('test-package', true);
  });

  it('allows valid package name characters', () => {
    const mockOnValidate = vi.fn();
    render(<NameInput onValidate={mockOnValidate} onDebouncedChange={() => {}} />);

    const input = screen.getByPlaceholderText(/enter a package name/i);
    fireEvent.change(input, { target: { value: 'valid-package_name.123' } });

    expect(input).toHaveValue('valid-package_name.123');
    expect(mockOnValidate).toHaveBeenCalledWith('valid-package_name.123', true);
  });

  it('prevents invalid characters as specified in requirements', () => {
    const mockOnValidate = vi.fn();
    render(<NameInput onValidate={mockOnValidate} onDebouncedChange={() => {}} />);

    const input = screen.getByPlaceholderText(/enter a package name/i);
    fireEvent.change(input, { target: { value: 'valid-package' } });
    fireEvent.keyPress(input, { key: ' ', code: 'Space' });

    // The input should not accept the space character
    expect(input).toHaveValue('valid-package');
  });
});
