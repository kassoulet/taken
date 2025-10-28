// Registry-specific validation functions
export const validateNpmPackageName = (packageName: string): boolean => {
  // npm package name rules:
  // - Length between 1 and 214 characters
  // - Can contain lowercase letters, numbers, hyphens, underscores, dots, and @ (for scopes)
  // - Cannot start with a dot or underscore
  // - Cannot contain uppercase letters in non-scoped packages
  if (!packageName || packageName.length > 214) {
    return false;
  }

  // Check if it's a scoped package (@scope/name)
  if (packageName.startsWith("@")) {
    const parts = packageName.split("/");
    if (parts.length !== 2) {
      return false;
    }

    const [scope, name] = parts;

    // Validate scope: @ + valid name
    if (!scope.startsWith("@") || !validateNpmPackageName(scope.substring(1))) {
      return false;
    }

    // Validate name part
    return validateNpmPackageName(name);
  }

  // Regular package name validation
  if (
    packageName.startsWith(".") ||
    packageName.startsWith("_") ||
    /^\d/.test(packageName)
  ) {
    return false;
  }

  // Check for valid characters (lowercase, numbers, hyphens, underscores, dots)
  const validCharsRegex = /^[a-z0-9._-]+$/;
  if (!validCharsRegex.test(packageName)) {
    return false;
  }

  return true;
};

export const validatePypiPackageName = (packageName: string): boolean => {
  // PyPI package name rules:
  // - 1 to 50 characters
  // - Letters, numbers, dots, hyphens, and underscores
  // - Must start and end with alphanumeric
  if (!packageName || packageName.length > 50) {
    return false;
  }

  const validCharsRegex = /^[a-zA-Z0-9]([a-zA-Z0-9._-]*[a-zA-Z0-9])?$/;
  return validCharsRegex.test(packageName);
};

export const validateCargoPackageName = (packageName: string): boolean => {
  // Cargo package name rules:
  // - 1 to 64 characters
  // - Lowercase letters, numbers, hyphens, and underscores
  // - Cannot start with a hyphen
  if (!packageName || packageName.length > 64) {
    return false;
  }

  if (packageName.startsWith("-")) {
    return false;
  }

  // Check for valid characters (letters, numbers, hyphens - no underscores for Cargo)
  const validCharsRegex = /^[a-z0-9][a-z0-9-]*$/;
  return validCharsRegex.test(packageName);
};

export const validateGithubRepoName = (repoName: string): boolean => {
  // GitHub repository name rules:
  // - Owner/repo format
  // - Each part 1 to 39 characters
  // - Letters, numbers, hyphens, dots, and underscores
  // - Cannot start or end with hyphen or dot
  if (!repoName) {
    return false;
  }

  const parts = repoName.split("/");
  if (parts.length !== 2) {
    return false; // Must be in owner/repo format
  }

  const [owner, repo] = parts;

  // Validate both owner and repo parts
  return validateGithubNamePart(owner) && validateGithubNamePart(repo);
};

const validateGithubNamePart = (part: string): boolean => {
  if (!part || part.length > 39) {
    return false;
  }

  // Cannot start or end with hyphen or dot
  if (
    part.startsWith("-") ||
    part.startsWith(".") ||
    part.endsWith("-") ||
    part.endsWith(".")
  ) {
    return false;
  }

  // Check for valid characters
  const validCharsRegex = /^[a-zA-Z0-9][a-zA-Z0-9._-]*$/;
  if (!validCharsRegex.test(part)) {
    return false;
  }

  return true;
};

// Main validation function
export interface ValidationResult {
  packageName: string;
  isValid: boolean;
  validationByRegistry: {
    [registryId: string]: {
      isValid: boolean;
      errors?: string[];
    };
  };
  timestamp: string;
}

export interface RegistryValidationResult {
  packageName: string;
  registryId: string;
  isValid: boolean;
  errors?: string[];
}

// Overload the function to handle different return types
export function validatePackageName(
  packageName: string,
  registryId?: string,
): ValidationResult | RegistryValidationResult {
  const timestamp = new Date().toISOString();

  if (registryId) {
    // Validate against specific registry
    switch (registryId) {
      case "npm":
        return {
          packageName,
          registryId,
          isValid: validateNpmPackageName(packageName),
          errors: validateNpmPackageName(packageName)
            ? undefined
            : ["Invalid npm package name format"],
        };
      case "pypi":
        return {
          packageName,
          registryId,
          isValid: validatePypiPackageName(packageName),
          errors: validatePypiPackageName(packageName)
            ? undefined
            : ["Invalid PyPI package name format"],
        };
      case "cargo":
        return {
          packageName,
          registryId,
          isValid: validateCargoPackageName(packageName),
          errors: validateCargoPackageName(packageName)
            ? undefined
            : ["Invalid Cargo package name format"],
        };
      case "github":
        return {
          packageName,
          registryId,
          isValid: validateGithubRepoName(packageName),
          errors: validateGithubRepoName(packageName)
            ? undefined
            : ["Invalid GitHub repository name format"],
        };
      default:
        return {
          packageName,
          registryId,
          isValid: false,
          errors: [`Unknown registry: ${registryId}`],
        };
    }
  } else {
    // Validate against all registries
    const npmValid = validateNpmPackageName(packageName);
    const pypiValid = validatePypiPackageName(packageName);
    const cargoValid = validateCargoPackageName(packageName);
    const githubValid = validateGithubRepoName(packageName);

    return {
      packageName,
      isValid: npmValid || pypiValid || cargoValid || githubValid, // Valid if any registry accepts it
      validationByRegistry: {
        npm: {
          isValid: npmValid,
          errors: npmValid ? undefined : ["Invalid npm package name format"],
        },
        pypi: {
          isValid: pypiValid,
          errors: pypiValid ? undefined : ["Invalid PyPI package name format"],
        },
        cargo: {
          isValid: cargoValid,
          errors: cargoValid
            ? undefined
            : ["Invalid Cargo package name format"],
        },
        github: {
          isValid: githubValid,
          errors: githubValid
            ? undefined
            : ["Invalid GitHub repository name format"],
        },
      },
      timestamp,
    };
  }
}
