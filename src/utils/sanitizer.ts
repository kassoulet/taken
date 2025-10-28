import DOMPurify from "dompurify";

// Sanitize user input before using in API requests
export const sanitizeInput = (input: string): string => {
  // Use DOMPurify to remove any potentially dangerous HTML
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [], // No HTML tags allowed
    ALLOWED_ATTR: [], // No attributes allowed
  });
};

// Sanitize response data before displaying to user
export const sanitizeResponse = (response: unknown): unknown => {
  if (typeof response === "string") {
    // If response is a string, sanitize it directly
    return DOMPurify.sanitize(response, {
      ALLOWED_TAGS: [], // No HTML tags allowed
      ALLOWED_ATTR: [], // No attributes allowed
    });
  } else if (typeof response === "object" && response !== null) {
    // If response is an object, sanitize its string properties
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(response)) {
      if (typeof value === "string") {
        sanitized[key] = DOMPurify.sanitize(value, {
          ALLOWED_TAGS: [], // No HTML tags allowed
          ALLOWED_ATTR: [], // No attributes allowed
        });
      } else if (typeof value === "object" && value !== null) {
        // Recursively sanitize nested objects
        sanitized[key] = sanitizeResponse(value);
      } else {
        // Non-string, non-object values are safe to pass through
        sanitized[key] = value;
      }
    }
    return sanitized;
  }
  // For non-string and non-object values, return as is
  return response;
};

// Additional sanitization for specific data types
export const sanitizePackageName = (packageName: string): string => {
  // This ensures the package name only contains allowed characters
  // as per the validation rules, preventing injection attacks
  return packageName.replace(/[^a-zA-Z0-9._/@-]/g, "");
};
