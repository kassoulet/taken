import { REGISTRIES, Registry } from "./registry-constants";
import { sanitizeResponse, sanitizeInput } from "../utils/sanitizer";

export interface PackageInfo {
  name?: string;
  version?: string;
  description?: string;
  author?: string;
  maintainer?: string;
  license?: string;
  lastUpdated?: string;
  publishDate?: string;
  tags?: string[];
  dependencies?: Record<string, string>;
}

export interface RegistryStatus {
  registry: Registry;
  packageName: string;
  status: "available" | "taken" | "error";
  timestamp: string;
  details?: object;
  error?: string;
  packageUrl?: string; // URL to the package page if it exists
  packageInfo?: PackageInfo; // Additional information about the package if it exists
}

export interface CheckOptions {
  timeout?: number;
  registries?: string[];
}

// Fetch with timeout
const fetchWithTimeout = async (
  url: string,
  options: RequestInit = {},
  timeout: number,
): Promise<Response> => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
};

// Get status for a single registry
export const getRegistryStatus = async (
  registry: Registry,
  packageName: string,
  timeout: number = 10000, // 10 seconds default
): Promise<RegistryStatus> => {
  try {
    // Sanitize the package name before using in the API request
    const sanitizedPackageName = sanitizeInput(packageName);

    // Construct the API URL based on the registry
    let apiUrl = "";
    switch (registry.id) {
      case "npm":
        apiUrl = `${registry.apiEndpoint}${sanitizedPackageName}`;
        break;
      case "pypi":
        apiUrl = `${registry.apiEndpoint}${sanitizedPackageName}/json`;
        break;
      case "cargo":
        apiUrl = `${registry.apiEndpoint}${sanitizedPackageName}`;
        break;
      default:
        throw new Error(`Unsupported registry: ${registry.id}`);
    }

    // Make the API request with timeout
    const response = await fetchWithTimeout(apiUrl, {}, timeout);

    // Determine status based on response - need to clone response to access status
    // even when the body may have been read already
    let status: "available" | "taken" | "error";
    if (response.ok) {
      status = "taken"; // 200 means the package exists
    } else if (response.status === 404) {
      status = "available"; // 404 means the package doesn't exist
    } else {
      status = "error"; // Other errors
    }

    // Sanitize response data before processing
    let details: object | undefined = undefined;
    // Only try to parse JSON for successful responses or for specific error cases where JSON might be returned
    if (response.ok || response.status === 404) {
      try {
        // Clone the response to be able to read the body multiple times if needed
        const clonedResponse = response.clone();
        const rawData = await clonedResponse.json();
        const sanitizedData = sanitizeResponse(rawData);
        details =
          typeof sanitizedData === "object" && sanitizedData !== null
            ? (sanitizedData as object)
            : undefined;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (e) {
        // If JSON parsing fails, we still have the status
      }
    }

    // Generate package URL if the package exists and the registry has packageUrl function
    let packageUrl: string | undefined;
    if (status === "taken" && registry.packageUrl) {
      packageUrl = registry.packageUrl(sanitizedPackageName);
    }

    // Extract package info if the package exists
    let packageInfo: PackageInfo | undefined;
    if (status === "taken" && details) {
      packageInfo = extractPackageInfo(
        details,
        registry.id,
        sanitizedPackageName,
      );
    }

    return {
      registry,
      packageName,
      status,
      timestamp: new Date().toISOString(),
      details,
      error: status === "error" ? `HTTP ${response.status}` : undefined,
      packageUrl,
      packageInfo,
    };
  } catch (error) {
    // Handle network errors, timeouts, CORS issues, etc.
    const errorMessage =
      error instanceof Error ? error.message : "Network error occurred";
    return {
      registry,
      packageName,
      status: "error",
      timestamp: new Date().toISOString(),
      error: errorMessage,
    };
  }
};

// Check package name across multiple registries
export const checkPackageName = async (
  packageName: string,
  options: CheckOptions = {},
): Promise<RegistryStatus[]> => {
  const {
    timeout = 10000,
    registries: registryIds = REGISTRIES.map((r) => r.id),
  } = options;

  // Filter registries based on the provided IDs
  const targetRegistries = REGISTRIES.filter((registry) =>
    registryIds.includes(registry.id),
  );

  // Check each registry in parallel
  const results = await Promise.all(
    targetRegistries.map((registry) =>
      getRegistryStatus(registry, packageName, timeout),
    ),
  );

  return results;
};

// Function to extract package information based on the registry
const extractPackageInfo = (
  details: unknown,
  registryId: string,
  packageName: string,
): PackageInfo => {
  const packageInfo: PackageInfo = {
    name: packageName,
  };

  if (typeof details !== "object" || details === null) {
    return packageInfo;
  }

  switch (registryId) {
    case "npm": {
      // NPM package information extraction
      const npmDetails = details as {
        "dist-tags"?: { latest?: string };
        versions?: Record<
          string,
          {
            description?: string;
            author?: { name?: string } | string;
            license?: string;
            dependencies?: Record<string, string>;
          }
        >;
        time?: Record<string, string>;
      };

      if (npmDetails) {
        const latestVersion = npmDetails["dist-tags"]?.latest;
        const versionData =
          latestVersion && npmDetails.versions
            ? (npmDetails.versions[latestVersion] as {
                description?: string;
                author?: { name?: string } | string;
                license?: string;
                dependencies?: Record<string, string>;
              })
            : undefined;

        if (versionData) {
          packageInfo.version = latestVersion;
          packageInfo.description = versionData.description;
          packageInfo.author =
            typeof versionData.author === "object" &&
            versionData.author &&
            "name" in versionData.author
              ? (versionData.author as { name?: string }).name
              : typeof versionData.author === "string"
                ? versionData.author
                : undefined;
          packageInfo.license = versionData.license;
          packageInfo.lastUpdated =
            latestVersion && npmDetails.time
              ? npmDetails.time[latestVersion]
              : undefined;
          packageInfo.publishDate = npmDetails.time?.created;
          packageInfo.tags = Object.keys(npmDetails["dist-tags"] || {});
          packageInfo.dependencies = versionData.dependencies || {};
        }
      }
      break;
    }

    case "pypi": {
      // PyPI package information extraction
      const pypiDetails = details as {
        info?: {
          version?: string;
          summary?: string;
          author?: string;
          maintainer?: string;
          license?: string;
          updated?: string;
          upload_time?: string;
          keywords?: string;
        };
      };

      if (pypiDetails.info) {
        const info = pypiDetails.info;
        packageInfo.version = info.version;
        packageInfo.description = info.summary;
        packageInfo.author = info.author;
        packageInfo.maintainer = info.maintainer;
        packageInfo.license = info.license;
        packageInfo.lastUpdated = info.updated;
        packageInfo.publishDate = info.upload_time;
        packageInfo.tags = info.keywords?.split(",") || [];
      }
      break;
    }

    case "cargo": {
      // Cargo package information extraction
      const cargoDetails = details as {
        crate?: {
          description?: string;
          owner_names?: string[];
          updated_at?: string;
          created_at?: string;
          keywords?: string[];
        };
        newest_version?: string;
      };

      if (cargoDetails.crate) {
        const crate = cargoDetails.crate;
        packageInfo.version = cargoDetails?.newest_version;
        packageInfo.description = crate.description;
        packageInfo.author = crate.owner_names?.join(", ");
        packageInfo.lastUpdated = crate.updated_at;
        packageInfo.publishDate = crate.created_at;
        packageInfo.tags = crate.keywords;
      }
      break;
    }

    default:
      break;
  }

  return packageInfo;
};

// Enhanced function to track success metrics (for SC-003)
export const checkPackageNameWithMetrics = async (
  packageName: string,
  options: CheckOptions = {},
): Promise<{ results: RegistryStatus[]; successRate: number }> => {
  const results = await checkPackageName(packageName, options);

  // Calculate metrics
  const totalChecks = results.length;
  const definitiveResults = results.filter(
    (r) => r.status === "available" || r.status === "taken",
  ).length;
  const successRate =
    totalChecks > 0 ? (definitiveResults / totalChecks) * 100 : 0;

  return {
    results,
    successRate,
  };
};
