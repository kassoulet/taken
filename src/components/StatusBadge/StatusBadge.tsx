import React from 'react';

interface StatusBadgeProps {
  status: 'available' | 'taken' | 'error';
  registryName: string;
  loading?: boolean;
  accessibilityLabel?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  registryName,
  loading = false,
  accessibilityLabel,
}) => {
  // Determine badge styling based on status
  const getStatusStyles = () => {
    switch (status) {
      case 'available':
        return {
          container: 'bg-green-100 border-green-300 dark:bg-green-900/30 dark:border-green-700',
          text: 'text-green-800 dark:text-green-200',
          icon: (
            <svg
              className="w-4 h-4 text-green-500 dark:text-green-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          ),
          label: 'Available',
        };
      case 'taken':
        return {
          container: 'bg-yellow-100 border-yellow-300 dark:bg-yellow-900/30 dark:border-yellow-700',
          text: 'text-yellow-800 dark:text-yellow-200',
          icon: (
            <svg
              className="w-4 h-4 text-yellow-500 dark:text-yellow-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ),
          label: 'Taken',
        };
      case 'error':
        return {
          container: 'bg-red-100 border-red-300 dark:bg-red-900/30 dark:border-red-700',
          text: 'text-red-800 dark:text-red-200',
          icon: (
            <svg
              className="w-4 h-4 text-red-500 dark:text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          ),
          label: 'Error',
        };
      default:
        return {
          container: 'bg-gray-100 border-gray-300 dark:bg-gray-800 dark:border-gray-600',
          text: 'text-gray-800 dark:text-gray-200',
          icon: null,
          label: 'Unknown',
        };
    }
  };

  const { container, text, icon, label } = getStatusStyles();

  return (
    <div
      className={`flex flex-col items-center justify-center p-4 rounded-lg border ${container} min-w-[120px] focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 font-body transition-colors duration-300`}
      role="status"
      aria-label={accessibilityLabel || `${registryName} registry status is ${label}`}
      tabIndex={0}
    >
      <div className="flex items-center justify-center mb-2" aria-hidden="true">
        {loading ? (
          <div
            className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900 dark:border-gray-100"
            role="status"
          >
            <span className="sr-only">Loading...</span>
          </div>
        ) : (
          icon
        )}
      </div>
      <div className="text-sm font-medium text-center">
        <div className={`${text} font-semibold`}>{registryName}</div>
        <div className={text}>{loading ? 'Checking...' : label}</div>
      </div>
    </div>
  );
};

export default StatusBadge;
