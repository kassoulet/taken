import {
  getCachedResult,
  cacheResult,
  clearCache,
} from "../../../src/services/cache-manager";

describe("cache-manager", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  describe("cacheResult", () => {
    it("should cache a result with the correct key format", () => {
      const mockResult = [
        {
          registry: { 
            id: "npm",
            name: "npm", 
            apiEndpoint: "https://registry.npmjs.org/"
          },
          packageName: "test-package",
          status: "available" as const,
          timestamp: new Date().toISOString(),
        },
      ];

      cacheResult("test-package", mockResult);

      const cached = sessionStorage.getItem("registry-check-npm-test-package");
      expect(cached).not.toBeNull();

      const parsed = JSON.parse(cached!);
      expect(parsed.packageName).toBe("test-package");
      expect(parsed.status).toBe("available");
    });
  });

  describe("getCachedResult", () => {
    it("should return cached result if it exists", async () => {
      const mockResult = {
        registry: {
          id: "npm",
          name: "npm",
          apiEndpoint: "https://registry.npmjs.org/",
        },
        packageName: "test-package",
        status: "available",
        timestamp: new Date().toISOString(),
      };

      sessionStorage.setItem(
        "registry-check-npm-test-package",
        JSON.stringify(mockResult),
      );

      const result = await getCachedResult("test-package");
      expect(result).toEqual([mockResult]);
    });

    it("should return null if no cached result exists", async () => {
      const result = await getCachedResult("non-existent-package");
      expect(result).toBeNull();
    });
  });

  describe("clearCache", () => {
    it("should clear all registry cache items", () => {
      sessionStorage.setItem(
        "registry-check-npm-test1",
        JSON.stringify({ packageName: "test1" }),
      );
      sessionStorage.setItem(
        "registry-check-pypi-test2",
        JSON.stringify({ packageName: "test2" }),
      );
      sessionStorage.setItem("other-item", "some-value");

      expect(sessionStorage.length).toBe(3);

      clearCache();

      expect(sessionStorage.getItem("registry-check-npm-test1")).toBeNull();
      expect(sessionStorage.getItem("registry-check-pypi-test2")).toBeNull();
      expect(sessionStorage.getItem("other-item")).toBe("some-value");
      expect(sessionStorage.length).toBe(1); // only the non-registry item remains
    });
  });
});
