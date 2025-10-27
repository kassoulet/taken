import { RegistryStatus } from './registry-checker';

// Cache using sessionStorage
const CACHE_PREFIX = 'registry-check';

// Generate cache key
const generateCacheKey = (registryId: string, packageName: string): string => {
  // Sanitize inputs to prevent issues with special characters in keys
  const sanitizedRegistryId = registryId.replace(/[^a-zA-Z0-9-_]/g, '');
  const sanitizedPackageName = packageName.replace(/[^a-zA-Z0-9-_.]/g, '');

  return `${CACHE_PREFIX}-${sanitizedRegistryId}-${sanitizedPackageName}`;
};

// Cache a result
export const cacheResult = (packageName: string, results: RegistryStatus[]): void => {
  try {
    // Store each registry result separately to allow for partial cache hits
    results.forEach(result => {
      const key = generateCacheKey(result.registry.id, packageName);
      sessionStorage.setItem(key, JSON.stringify(result));
    });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error: unknown) {
    // Silently fail on cache errors to not break the application
  }
};

// Get cached result
export const getCachedResult = async (packageName: string): Promise<RegistryStatus[] | null> => {
  try {
    // This function reconstructs results from all registries for the given package name
    const cachedResults: RegistryStatus[] = [];

    // We'll try to find entries for all possible registries
    const registryIds = ['npm', 'pypi', 'cargo'];

    for (const registryId of registryIds) {
      const key = generateCacheKey(registryId, packageName);
      const cachedItem = sessionStorage.getItem(key);

      if (cachedItem) {
        try {
          const parsed = JSON.parse(cachedItem) as RegistryStatus;
          cachedResults.push(parsed);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (e: unknown) {
          // Failed to parse cached item
        }
      }
    }

    // If we found any cached results, return them
    return cachedResults.length > 0 ? cachedResults : null;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error: unknown) {
    return null;
  }
};

// Clear all cache entries related to registry checks
export const clearCache = (): void => {
  try {
    // Get all keys and remove those that match our cache pattern
    const keysToRemove: string[] = [];

    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && key.startsWith(CACHE_PREFIX)) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach(key => sessionStorage.removeItem(key));
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error: unknown) {
    // Failed to clear cache
  }
};

// Additional cache utility: Check if a specific registry result is cached
export const isCached = (registryId: string, packageName: string): boolean => {
  try {
    const key = generateCacheKey(registryId, packageName);
    return sessionStorage.getItem(key) !== null;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error: unknown) {
    return false;
  }
};

// Get cached result for a specific registry
export const getCachedRegistryResult = async (
  registryId: string,
  packageName: string
): Promise<RegistryStatus | null> => {
  try {
    const key = generateCacheKey(registryId, packageName);
    const cachedItem = sessionStorage.getItem(key);

    if (cachedItem) {
      try {
        return JSON.parse(cachedItem) as RegistryStatus;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (e: unknown) {
        return null;
      }
    }

    return null;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error: unknown) {
    return null;
  }
};
