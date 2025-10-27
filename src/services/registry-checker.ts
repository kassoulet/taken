import { REGISTRIES, Registry } from './registry-constants';
import { sanitizeResponse, sanitizeInput } from '../utils/sanitizer';

export interface RegistryStatus {
  registry: Registry;
  packageName: string;
  status: 'available' | 'taken' | 'error';
  timestamp: string;
  details?: object;
  error?: string;
}

export interface CheckOptions {
  timeout?: number;
  registries?: string[];
}

// Fetch with timeout
const fetchWithTimeout = async (
  url: string,
  options: RequestInit = {},
  timeout: number
): Promise<Response> => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
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
  timeout: number = 10000 // 10 seconds default
): Promise<RegistryStatus> => {
  try {
    // Sanitize the package name before using in the API request
    const sanitizedPackageName = sanitizeInput(packageName);

    // Construct the API URL based on the registry
    let apiUrl = '';
    switch (registry.id) {
      case 'npm':
        apiUrl = `${registry.apiEndpoint}${sanitizedPackageName}`;
        break;
      case 'pypi':
        apiUrl = `${registry.apiEndpoint}${sanitizedPackageName}/json`;
        break;
      case 'cargo':
        apiUrl = `${registry.apiEndpoint}${sanitizedPackageName}`;
        break;
      default:
        throw new Error(`Unsupported registry: ${registry.id}`);
    }

    // Make the API request with timeout
    const response = await fetchWithTimeout(apiUrl, {}, timeout);

    // Determine status based on response - need to clone response to access status
    // even when the body may have been read already
    let status: 'available' | 'taken' | 'error';
    if (response.ok) {
      status = 'taken'; // 200 means the package exists
    } else if (response.status === 404) {
      status = 'available'; // 404 means the package doesn't exist
    } else {
      status = 'error'; // Other errors
    }

    // Sanitize response data before processing
    let details = undefined;
    // Only try to parse JSON for successful responses or for specific error cases where JSON might be returned
    if (response.ok || response.status === 404) {
      try {
        // Clone the response to be able to read the body multiple times if needed
        const clonedResponse = response.clone();
        const rawData = await clonedResponse.json();
        details = sanitizeResponse(rawData);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (e: unknown) {
        // If JSON parsing fails, we still have the status
      }
    }

    return {
      registry,
      packageName,
      status,
      timestamp: new Date().toISOString(),
      details,
      error: status === 'error' ? `HTTP ${response.status}` : undefined,
    };
  } catch (error) {
    // Handle network errors, timeouts, CORS issues, etc.
    const errorMessage = error instanceof Error ? error.message : 'Network error occurred';
    return {
      registry,
      packageName,
      status: 'error',
      timestamp: new Date().toISOString(),
      error: errorMessage,
    };
  }
};

// Check package name across multiple registries
export const checkPackageName = async (
  packageName: string,
  options: CheckOptions = {}
): Promise<RegistryStatus[]> => {
  const { timeout = 10000, registries: registryIds = REGISTRIES.map(r => r.id) } = options;

  // Filter registries based on the provided IDs
  const targetRegistries = REGISTRIES.filter(registry => registryIds.includes(registry.id));

  // Check each registry in parallel
  const results = await Promise.all(
    targetRegistries.map(registry => getRegistryStatus(registry, packageName, timeout))
  );

  return results;
};

// Enhanced function to track success metrics (for SC-003)
export const checkPackageNameWithMetrics = async (
  packageName: string,
  options: CheckOptions = {}
): Promise<{ results: RegistryStatus[]; successRate: number }> => {
  const results = await checkPackageName(packageName, options);

  // Calculate metrics
  const totalChecks = results.length;
  const definitiveResults = results.filter(
    r => r.status === 'available' || r.status === 'taken'
  ).length;
  const successRate = totalChecks > 0 ? (definitiveResults / totalChecks) * 100 : 0;

  return {
    results,
    successRate,
  };
};
