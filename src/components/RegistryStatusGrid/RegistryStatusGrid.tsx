import React, { useState } from "react";
import StatusBadge from "../StatusBadge/StatusBadge";
import PackageDetails from "../PackageDetails/PackageDetails";
import { RegistryStatus } from "../../services/registry-checker";

interface RegistryStatusGridProps {
  packageName: string;
  registryStatuses: RegistryStatus[];
  loading: boolean;
  error?: string;
  onRetry?: (packageName: string) => void;
}

const RegistryStatusGrid: React.FC<RegistryStatusGridProps> = ({
  packageName,
  registryStatuses,
  loading,
  error,
  onRetry,
}) => {
  const [expandedRegistry, setExpandedRegistry] = useState<string | null>(null);

  // If loading and no statuses yet, show loading placeholders
  if (loading && registryStatuses.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <h2 className="text-xl font-semibold text-center mb-6 font-body text-gray-900 dark:text-gray-100">
          Checking registries for:{" "}
          <span className="font-mono">{packageName}</span>
        </h2>
        <div
          className="grid grid-cols-2 md:grid-cols-3 gap-4"
          role="list"
          aria-label="Registry status loading placeholders"
        >
          {["npm", "PyPI", "Cargo"].map((registryName, index) => (
            <div
              key={index}
              className="flex flex-col items-center justify-center p-4 rounded-lg border bg-gray-50 dark:bg-gray-800 dark:border-gray-700 min-w-[120px] transition-colors duration-300"
              role="listitem"
              aria-label={`${registryName} registry status loading`}
              tabIndex={0}
            >
              <div
                className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900 dark:border-gray-100 mb-2"
                role="status"
              >
                <span className="sr-only">Loading...</span>
              </div>
              <div className="text-sm font-medium text-center font-body">
                <div className="font-semibold text-gray-900 dark:text-gray-100">
                  {registryName}
                </div>
                <div className="text-gray-700 dark:text-gray-300">
                  Checking...
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const toggleExpand = (registryId: string) => {
    setExpandedRegistry(expandedRegistry === registryId ? null : registryId);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <h2 className="text-xl font-semibold text-center mb-6 font-body text-gray-900 dark:text-gray-100">
        Results for: <span className="font-mono">{packageName}</span>
      </h2>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-center">
          <div className="font-medium">Error occurred:</div>
          <div>{error}</div>
          {onRetry && (
            <button
              onClick={() => {
                onRetry(packageName);
              }}
              className="mt-2 px-4 py-2 bg-red-100 hover:bg-red-200 dark:bg-red-800/50 dark:hover:bg-red-800 text-red-700 dark:text-red-200 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 font-body"
              aria-label="Retry registry check"
            >
              Retry
            </button>
          )}
        </div>
      )}

      <div
        className="grid grid-cols-2 md:grid-cols-3 gap-4"
        role="list"
        aria-label="Registry status results"
      >
        {registryStatuses.map((statusObj, index) => {
          const isExpanded = expandedRegistry === statusObj.registry.id;
          const hasPackageInfo =
            statusObj.status === "taken" && statusObj.packageInfo;

          return (
            <div key={`${statusObj.registry.id}-${index}`} role="listitem">
              <div
                onClick={() =>
                  hasPackageInfo && toggleExpand(statusObj.registry.id)
                }
                className={hasPackageInfo ? "cursor-pointer" : ""}
              >
                <StatusBadge
                  status={statusObj.status}
                  registryName={statusObj.registry.name}
                  loading={loading}
                  accessibilityLabel={`${statusObj.registry.name} registry status is ${statusObj.status}`}
                  registryIcon={statusObj.registry.icon}
                  packageUrl={statusObj.packageUrl}
                />
              </div>

              {isExpanded && hasPackageInfo && statusObj.packageInfo && (
                <div className="mt-2">
                  <PackageDetails
                    packageInfo={statusObj.packageInfo}
                    registryName={statusObj.registry.name}
                    packageName={statusObj.packageName}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RegistryStatusGrid;
