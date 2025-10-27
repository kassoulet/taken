import React, { useState, useEffect, useCallback } from 'react';
import { sanitizeInput } from '../../utils/sanitizer';
import { useDebounce } from '../../hooks/useDebounce';

interface NameInputProps {
  onValidate: (packageName: string, isValid: boolean) => void;
  onDebouncedChange: (packageName: string) => void;
  onSanitizedInput?: (sanitizedValue: string) => void;
  debounceMs?: number;
  placeholder?: string;
  disabled?: boolean;
}

const NameInput: React.FC<NameInputProps> = ({
  onValidate,
  onDebouncedChange,
  onSanitizedInput,
  debounceMs = 500,
  placeholder = 'Enter a package name...',
  disabled = false,
}) => {
  const [value, setValue] = useState<string>('');
  const debouncedValue = useDebounce<string>(value, debounceMs);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Handle input changes with real-time validation
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    // Sanitize input as user types to prevent special characters
    // For security and to maintain consistency with the requirement to restrict input
    const sanitizedInput = sanitizeInput(inputValue);

    // Further restrict to only allowed characters across registries
    const restrictedInput = sanitizedInput.replace(/[^a-zA-Z0-9._/@-]/g, '');

    setValue(restrictedInput);

    // Validate the input
    if (restrictedInput !== inputValue) {
      setValidationError('Invalid characters removed');
    } else {
      setValidationError(null);
    }

    // Notify about sanitized input if required
    if (onSanitizedInput) {
      onSanitizedInput(restrictedInput);
    }
  };

  // Component mount effect
  useEffect(() => {
    return () => {
      // Cleanup if needed
    };
  }, []); // Only run on mount

  // Effect for handling debounced changes
  useEffect(() => {
    if (debouncedValue !== undefined) {
      onDebouncedChange(debouncedValue);
    }
  }, [debouncedValue, onDebouncedChange]);

  // Effect for validation
  useEffect(() => {
    // Determine if input is valid based on our criteria
    // For now, we'll consider it valid if it's not empty and contains only allowed characters
    const isValid = value.length > 0 && /^[a-zA-Z0-9._/@-]+$/.test(value) && value.length <= 214;
    onValidate(value, isValid);
  }, [value, onValidate]); // Only depend on value and onValidate



  // Memoize the clear function
  const handleClear = useCallback(() => {
    setValue('');
    onValidate('', false);
    onDebouncedChange('');
  }, [onValidate, onDebouncedChange]);

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full px-4 py-3 pr-10 text-lg border ${
            validationError
              ? 'border-red-500 dark:border-red-500'
              : 'border-gray-300 dark:border-gray-600'
          } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 outline-none transition ${
            disabled
              ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed'
              : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
          } font-body`}
          aria-label="Package name"
          aria-invalid={!!validationError}
          aria-describedby={validationError ? 'name-input-error' : undefined}
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          {value && (
            <button
              type="button"
              onClick={handleClear}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none"
              aria-label="Clear input"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
      </div>
      {validationError && (
        <p id="name-input-error" className="mt-2 text-sm text-red-600 dark:text-red-400 font-body">
          {validationError}
        </p>
      )}
    </div>
  );
};

export default NameInput;
