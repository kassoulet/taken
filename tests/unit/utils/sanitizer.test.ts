import { sanitizeInput, sanitizeResponse, sanitizePackageName } from "../../../src/utils/sanitizer";

describe("sanitizer", () => {
  describe("sanitizeInput", () => {
    it("should remove HTML tags from input", () => {
      const maliciousInput = '<script>alert("xss")</script>';
      const sanitized = sanitizeInput(maliciousInput);
      expect(sanitized).toBe('alert("xss")');
    });

    it("should handle normal inputs correctly", () => {
      const normalInput = "my-package-name";
      const sanitized = sanitizeInput(normalInput);
      expect(sanitized).toBe("my-package-name");
    });

    it("should handle special characters appropriately", () => {
      const inputWithSpecialChars = "my.package_123-test";
      const sanitized = sanitizeInput(inputWithSpecialChars);
      expect(sanitized).toBe("my.package_123-test");
    });
  });

  describe("sanitizeResponse", () => {
    it("should sanitize registry response data", () => {
      const mockResponse = {
        name: "package",
        description: "<script>malicious code</script>Description here",
        version: "1.0.0",
      };

      const sanitized = sanitizeResponse(mockResponse);
      expect(sanitized.name).toBe("package");
      expect(sanitized.description).toBe("malicious codeDescription here"); // Our mock sanitizer just removes tags, not the content
      expect(sanitized.version).toBe("1.0.0");
    });

    it("should handle string responses", () => {
      const mockString = "<div>Some content</div>";
      const sanitized = sanitizeResponse(mockString);
      expect(sanitized).toBe("Some content");
    });
  });
});
