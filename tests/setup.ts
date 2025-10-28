import { vi } from "vitest";
import "@testing-library/jest-dom/vitest";

// Mock DOMPurify for sanitizer tests
vi.mock("dompurify", () => {
  return {
    __esModule: true,
    default: {
      sanitize: (str: string) => {
        // Simple sanitization for tests - remove basic HTML tags
        return str.replace(/<[^>]*>/g, "");
      },
    },
  };
});

// Mock console.error to prevent test noise from React
// @ts-expect-error - Need to override console methods for testing
global.console = {
  ...console,
  error: vi.fn(),
  warn: vi.fn(),
};

// Mock sessionStorage
const mockSessionStorage = (() => {
  let store: { [key: string]: string } = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => Object.keys(store)[index] || null,
  };
})();

Object.defineProperty(window, "sessionStorage", {
  value: mockSessionStorage,
});

// Mock fetch
global.fetch = vi.fn();

// For React Testing Library to work properly with happy-dom
// We need to ensure the necessary DOM globals are available
