import { useState, useCallback } from 'react';
import { checkPackageName, RegistryStatus } from '../services/registry-checker';
import { getCachedResult, cacheResult } from '../services/cache-manager';
import { sanitizeInput } from '../utils/sanitizer';

// Options for the hook
interface UseRegistryCheckerOptions {
  delay?: number;
  enableCache?: boolean;
}

// Return type for the hook
interface UseRegistryCheckerReturn {
  results: RegistryStatus[] | null;
  loading: boolean;
  error: string | null;
  checkPackage: (packageName: string) => Promise<void>;
  clearResults: () => void;
}

export const useRegistryChecker = (
  options: UseRegistryCheckerOptions = {}
): UseRegistryCheckerReturn => {
  const { enableCache = true } = options;
  const [results, setResults] = useState<RegistryStatus[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Function to check a package name across registries
  const checkPackage = useCallback(
    async (packageName: string) => {
      // Sanitize the input package name
      const sanitizedPackageName = sanitizeInput(packageName);

      if (!sanitizedPackageName) {
        setError('Package name is required');
        setResults(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Check if results are already cached
        if (enableCache) {
          const cached = await getCachedResult(sanitizedPackageName);
          if (cached) {
            setResults(cached);
            setLoading(false);
            return;
          }
        }

        // Perform the registry check
        const registryResults = await checkPackageName(sanitizedPackageName);

        // Cache the results if caching is enabled
        if (enableCache) {
          cacheResult(sanitizedPackageName, registryResults);
        }

        // Update state with results
        setResults(registryResults);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred while checking package name';
        setError(errorMessage || 'An error occurred while checking package name');
        setResults(null);
      } finally {
        setLoading(false);
      }
    },
    [enableCache]
  ); // Only depend on enableCache since other values are function parameters

  // Function to clear results
  const clearResults = useCallback(() => {
    setResults(null);
    setError(null);
  }, []);

  return {
    results,
    loading,
    error,
    checkPackage,
    clearResults,
  };
};
