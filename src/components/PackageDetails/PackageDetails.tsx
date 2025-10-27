import React from "react";
import { PackageInfo } from "../../services/registry-checker";

interface PackageDetailsProps {
  packageInfo: PackageInfo;
  registryName: string;
  packageName: string;
}

const PackageDetails: React.FC<PackageDetailsProps> = ({
  packageInfo,
  registryName,
  packageName,
}) => {
  // Format date to be more readable
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString; // Return original if parsing fails
    }
  };

  return (
    <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
        {registryName} Package: {packageName}
      </h3>

      <div className="space-y-2">
        {packageInfo.version && (
          <div className="flex">
            <span className="font-medium text-gray-700 dark:text-gray-300 w-32">
              Version:
            </span>
            <span className="text-gray-900 dark:text-gray-100">
              {packageInfo.version}
            </span>
          </div>
        )}

        {packageInfo.author && (
          <div className="flex">
            <span className="font-medium text-gray-700 dark:text-gray-300 w-32">
              Author:
            </span>
            <span className="text-gray-900 dark:text-gray-100">
              {packageInfo.author}
            </span>
          </div>
        )}

        {packageInfo.maintainer && (
          <div className="flex">
            <span className="font-medium text-gray-700 dark:text-gray-300 w-32">
              Maintainer:
            </span>
            <span className="text-gray-900 dark:text-gray-100">
              {packageInfo.maintainer}
            </span>
          </div>
        )}

        {packageInfo.license && (
          <div className="flex">
            <span className="font-medium text-gray-700 dark:text-gray-300 w-32">
              License:
            </span>
            <span className="text-gray-900 dark:text-gray-100">
              {packageInfo.license}
            </span>
          </div>
        )}

        {packageInfo.lastUpdated && (
          <div className="flex">
            <span className="font-medium text-gray-700 dark:text-gray-300 w-32">
              Last Updated:
            </span>
            <span className="text-gray-900 dark:text-gray-100">
              {formatDate(packageInfo.lastUpdated)}
            </span>
          </div>
        )}

        {packageInfo.publishDate && (
          <div className="flex">
            <span className="font-medium text-gray-700 dark:text-gray-300 w-32">
              Published:
            </span>
            <span className="text-gray-900 dark:text-gray-100">
              {formatDate(packageInfo.publishDate)}
            </span>
          </div>
        )}

        {packageInfo.description && (
          <div className="mt-3">
            <span className="font-medium text-gray-700 dark:text-gray-300 block mb-1">
              Description:
            </span>
            <p className="text-gray-900 dark:text-gray-100">
              {packageInfo.description}
            </p>
          </div>
        )}

        {packageInfo.tags && packageInfo.tags.length > 0 && (
          <div className="mt-3">
            <span className="font-medium text-gray-700 dark:text-gray-300 block mb-1">
              Tags:
            </span>
            <div className="flex flex-wrap gap-1">
              {packageInfo.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PackageDetails;
