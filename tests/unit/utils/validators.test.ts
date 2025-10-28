import {
  validatePackageName,
  validateNpmPackageName,
  validatePypiPackageName,
  validateCargoPackageName,
  validateGithubRepoName,
} from "../../../src/utils/validators";

describe("validators", () => {
  describe("validateNpmPackageName", () => {
    it("should return true for valid npm package names", () => {
      expect(validateNpmPackageName("react")).toBe(true);
      expect(validateNpmPackageName("@babel/core")).toBe(true);
      expect(validateNpmPackageName("my-package")).toBe(true);
      expect(validateNpmPackageName("my_package")).toBe(true);
      expect(validateNpmPackageName("my.package")).toBe(true);
    });

    it("should return false for invalid npm package names", () => {
      expect(validateNpmPackageName("")).toBe(false);
      expect(validateNpmPackageName("123")).toBe(false);
      expect(validateNpmPackageName("my package")).toBe(false);
      expect(validateNpmPackageName("MY-UPPER-CASE")).toBe(false);
    });
  });

  describe("validatePypiPackageName", () => {
    it("should return true for valid PyPI package names", () => {
      expect(validatePypiPackageName("requests")).toBe(true);
      expect(validatePypiPackageName("my_package")).toBe(true);
      expect(validatePypiPackageName("my-package")).toBe(true);
    });

    it("should return false for invalid PyPI package names", () => {
      expect(validatePypiPackageName("")).toBe(false);
      expect(validatePypiPackageName("my package")).toBe(false);
      expect(validatePypiPackageName("MyPackage!")).toBe(false);
    });
  });

  describe("validateCargoPackageName", () => {
    it("should return true for valid Cargo package names", () => {
      expect(validateCargoPackageName("serde")).toBe(true);
      expect(validateCargoPackageName("tokio")).toBe(true);
      expect(validateCargoPackageName("my-package")).toBe(true);
    });

    it("should return false for invalid Cargo package names", () => {
      expect(validateCargoPackageName("")).toBe(false);
      expect(validateCargoPackageName("MyPackage")).toBe(false);
      expect(validateCargoPackageName("my_package")).toBe(false);
      expect(validateCargoPackageName("my package")).toBe(false);
    });
  });

  describe("validateGithubRepoName", () => {
    it("should return true for valid GitHub repo names (owner/repo format)", () => {
      expect(validateGithubRepoName("user/repo")).toBe(true);
      expect(validateGithubRepoName("my-org/my-project")).toBe(true);
    });

    it("should return false for invalid GitHub repo names", () => {
      expect(validateGithubRepoName("")).toBe(false);
      expect(validateGithubRepoName("user")).toBe(false);
      expect(validateGithubRepoName("user/")).toBe(false);
      expect(validateGithubRepoName("/repo")).toBe(false);
      expect(validateGithubRepoName("user/repo/extra")).toBe(false);
    });
  });

  describe("validatePackageName", () => {
    it("should validate against all registries", () => {
      const result = validatePackageName("valid-package");
      expect(result.isValid).toBe(true);
      expect(result.packageName).toBe("valid-package");
      expect(result.validationByRegistry).toBeDefined();
    });

    it("should handle scoped npm packages", () => {
      const result = validatePackageName("@scope/package");
      expect(result.isValid).toBe(true);
    });
  });
});
