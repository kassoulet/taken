// Helper functions for the application

// Debounce function to limit how often a function is called
export const debounce = <T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number,
) => {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: Parameters<T>): void {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Format date for display
export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

// Deep clone an object
export const deepClone = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
};

// Check if a value is a plain object
export const isObject = (value: unknown): value is object => {
  return value !== null && typeof value === "object" && !Array.isArray(value);
};

// Remove special characters from a string (keeps alphanumeric, hyphens, underscores, dots)
export const cleanString = (str: string): string => {
  if (!str) return "";
  return str.replace(/[^a-zA-Z0-9._-]/g, "");
};

// Check if a string matches a registry pattern
export const matchesRegistryPattern = (
  input: string,
  registry: string,
): boolean => {
  if (!input) return false;

  switch (registry) {
    case "npm":
      // Check if it's a valid npm package name or scoped package
      return /^(@[a-z0-9-~][a-z0-9-._~]*)?\/?[a-z0-9-~][a-z0-9-._~]*$/.test(
        input,
      );
    case "pypi":
      // Check if it's a valid PyPI package name
      return /^[a-zA-Z0-9]([a-zA-Z0-9._-]*[a-zA-Z0-9])?$/.test(input);
    case "cargo":
      // Check if it's a valid Cargo package name
      return /^[a-z0-9][a-z0-9_-]*$/.test(input);
    case "github":
      // Check if it's a valid GitHub owner/repo format
      return /^[a-zA-Z0-9][a-zA-Z0-9._-]*\/[a-zA-Z0-9][a-zA-Z0-9._-]*$/.test(
        input,
      );
    default:
      return false;
  }
};

// Generate a unique ID
export const generateId = (): string => {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
};
