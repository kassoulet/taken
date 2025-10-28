import {
  checkPackageName,
  getRegistryStatus,
} from "../../../src/services/registry-checker";
import { vi } from "vitest";

interface Registry {
  id: string;
  name: string;
  apiEndpoint: string;
}

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("registry-checker", () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  describe("getRegistryStatus", () => {
    it('should return "taken" for successful responses (status 200)', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ name: "example-package" }),
      } as Response);

      const registry: Registry = {
        id: "npm",
        name: "npm",
        apiEndpoint: "https://registry.npmjs.org/",
      };
      const result = await getRegistryStatus(registry, "example-package");

      expect(result.status).toBe("taken");
      expect(result.packageName).toBe("example-package");
      expect(result.registry.id).toBe("npm");
    });

    it('should return "available" for not found responses (status 404)', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ error: "Not found" }),
      } as Response);

      const registry: Registry = {
        id: "npm",
        name: "npm",
        apiEndpoint: "https://registry.npmjs.org/",
      };
      const result = await getRegistryStatus(registry, "nonexistent-package");

      expect(result.status).toBe("available");
    });

    it('should return "error" for other error responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: "Server error" }),
      } as Response);

      const registry: Registry = {
        id: "npm",
        name: "npm",
        apiEndpoint: "https://registry.npmjs.org/",
      };
      const result = await getRegistryStatus(registry, "problematic-package");

      expect(result.status).toBe("error");
    });

    it("should handle timeout correctly", async () => {
      mockFetch.mockImplementationOnce(() => {
        return new Promise((_, reject) => {
          setTimeout(
            () => reject(new Error("The operation was aborted.")),
            100,
          );
        });
      });

      const registry: Registry = {
        id: "npm",
        name: "npm",
        apiEndpoint: "https://registry.npmjs.org/",
      };

      const result = await getRegistryStatus(registry, "test-package", 500);

      // When there's a timeout/abort error, the function should return an error status, not throw
      expect(result.status).toBe("error");
      expect(result.error).toBeDefined();
    });
  });

  describe("checkPackageName", () => {
    it("should check all registries and return results", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ name: "existing-package" }),
      } as Response);

      const results = await checkPackageName("test-package");

      expect(results).toHaveLength(3); // npm, pypi, cargo
      expect(results[0].status).toBe("taken"); // npm
      expect(results[1].status).toBe("taken"); // pypi
      expect(results[2].status).toBe("taken"); // cargo
    });
  });
});
