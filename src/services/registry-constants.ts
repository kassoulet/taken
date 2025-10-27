// Registry constants for the application

export interface Registry {
  id: string;
  name: string;
  apiEndpoint: string;
  validateFn?: (packageName: string) => boolean;
  docUrl?: string;
}

export const REGISTRIES: Registry[] = [
  {
    id: 'npm',
    name: 'npm',
    apiEndpoint: 'https://registry.npmjs.org/',
    docUrl: 'https://docs.npmjs.com/about-packages',
  },
  {
    id: 'pypi',
    name: 'PyPI',
    apiEndpoint: 'https://pypi.org/pypi/',
    docUrl: 'https://pypi.org/help/',
  },
  {
    id: 'cargo',
    name: 'Cargo',
    apiEndpoint: 'https://crates.io/api/v1/crates/',
    docUrl: 'https://doc.rust-lang.org/cargo/',
  },
];

// Get registry by ID
export const getRegistryById = (id: string): Registry | undefined => {
  return REGISTRIES.find(registry => registry.id === id);
};

// Get registry by name
export const getRegistryByName = (name: string): Registry | undefined => {
  return REGISTRIES.find(registry => registry.name === name);
};
