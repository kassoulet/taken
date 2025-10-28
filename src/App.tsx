import { useState, useEffect, useCallback } from "react";
import NameInput from "./components/NameInput/NameInput";
import RegistryStatusGrid from "./components/RegistryStatusGrid/RegistryStatusGrid";
import { useRegistryChecker } from "./hooks/useRegistryChecker";
import { RegistryStatus } from "./services/registry-checker";

function App() {
  const [packageName, setPackageName] = useState<string>("");
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const { results, loading, error, checkPackage, clearResults } =
    useRegistryChecker();

  useEffect(() => {
    // Check system preference for dark mode
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    setDarkMode(mediaQuery.matches);

    // Set up listener for changes to system preference
    const handler = (e: MediaQueryListEvent) => setDarkMode(e.matches);
    mediaQuery.addEventListener("change", handler);

    // Clean up listener
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  // Apply dark mode class to document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const handleValidate = useCallback((value: string, isValid: boolean) => {
    // Validation is handled internally by the NameInput component
    // No need to do anything here as packageName is managed by handleDebouncedChange
    // Explicitly mark parameters as unused to prevent linting errors
    // Use the parameters to prevent unused variable errors
    if (value && isValid) return;
  }, []);

  const handleDebouncedChange = useCallback(
    (value: string) => {
      // Update the package name state
      setPackageName(value);

      if (value.trim()) {
        // Only check if the value is not empty
        checkPackage(value);
      } else {
        clearResults();
      }
    },
    [checkPackage, clearResults],
  );

  // Update the onRetry function to use useCallback to prevent stale closures
  const handleRetry = useCallback(
    (packageName: string) => {
      checkPackage(packageName);
    },
    [checkPackage],
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Big "Taken?" header section */}
      <div className="flex flex-col items-center justify-center h-1/2 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 py-12 transition-colors duration-300">
        <h1 className="text-7xl md:text-9xl font-bold text-center text-gray-900 dark:text-white mb-4 font-title">
          Taken?
        </h1>
        <h2 className="text-xl md:text-2xl font-normal text-center text-gray-700 dark:text-gray-300">
          Multi-Registry Package Name Checker
        </h2>
      </div>

      {/* Search and results section */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-10">
          <NameInput
            key="name-input-field" // Add a stable key to preserve component instance
            onValidate={handleValidate}
            onDebouncedChange={handleDebouncedChange}
            onSanitizedInput={(sanitizedValue: string) => {
              // Update state with sanitized value if needed
              if (sanitizedValue) return;
            }}
          />
        </div>

        {results && results.length > 0 && (
          <div className="mt-8">
            <RegistryStatusGrid
              key={`registry-status-grid-${packageName}`} // Add a key based on the package name to prevent unnecessary re-renders
              packageName={packageName}
              registryStatuses={results as RegistryStatus[]}
              loading={loading}
              error={error || undefined}
              onRetry={handleRetry}
            />
          </div>
        )}

        {!results && !loading && !error && (
          <div className="mt-12 text-center text-gray-500 dark:text-gray-400">
            <p className="font-body">
              Enter a package name above to check its availability across
              registries
            </p>
            <div className="mt-8 grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 min-w-[120px] transition-colors duration-300">
                <div className="text-sm font-semibold text-center text-gray-700 dark:text-gray-300 font-body">
                  npm
                </div>
              </div>
              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 min-w-[120px] transition-colors duration-300">
                <div className="text-sm font-semibold text-center text-gray-700 dark:text-gray-300 font-body">
                  PyPI
                </div>
              </div>
              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 min-w-[120px] transition-colors duration-300">
                <div className="text-sm font-semibold text-center text-gray-700 dark:text-gray-300 font-body">
                  Cargo
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Footer with credits */}
      <footer className="py-6 text-center text-gray-600 dark:text-gray-400 text-sm">
        <p>
          Created by{" "}
          <a 
            href="https://github.com/kassoulet/taken" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Gautier Portet
          </a>
        </p>
      </footer>
    </div>
  );
}

export default App;
