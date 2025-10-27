// Registry constants for the application

export interface Registry {
  id: string;
  name: string;
  apiEndpoint: string;
  validateFn?: (packageName: string) => boolean;
  docUrl?: string;
  icon?: string; // URL to the registry's icon
  packageUrl?: (packageName: string) => string; // Function to generate package URL
}

export const REGISTRIES: Registry[] = [
  {
    id: "npm",
    name: "npm",
    apiEndpoint: "https://registry.npmjs.org/",
    docUrl: "https://docs.npmjs.com/about-packages",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v7/icons/npm.svg",
    packageUrl: (packageName: string) =>
      `https://www.npmjs.com/package/${packageName}`,
  },
  {
    id: "pypi",
    name: "PyPI",
    apiEndpoint: "https://pypi.org/pypi/",
    docUrl: "https://pypi.org/help/",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v7/icons/pypi.svg",
    packageUrl: (packageName: string) =>
      `https://pypi.org/project/${packageName}/`,
  },
  {
    id: "cargo",
    name: "Cargo",
    apiEndpoint: "https://crates.io/api/v1/crates/",
    docUrl: "https://doc.rust-lang.org/cargo/",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v7/icons/rust.svg",
    packageUrl: (packageName: string) =>
      `https://crates.io/crates/${packageName}`,
  },
];

// Get registry by ID
export const getRegistryById = (id: string): Registry | undefined => {
  return REGISTRIES.find((registry) => registry.id === id);
};

// Get registry by name
export const getRegistryByName = (name: string): Registry | undefined => {
  return REGISTRIES.find((registry) => registry.name === name);
};
