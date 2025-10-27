import { checkPackageName, getRegistryStatus } from '../src/services/registry-checker';

// Mock fetch
global.fetch = jest.fn();

describe('registry-checker', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
  });

  describe('getRegistryStatus', () => {
    it('should return "taken" for successful responses (status 200)', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ name: 'example-package' }),
      });

      const registry = { id: 'npm', name: 'npm', apiEndpoint: 'https://registry.npmjs.org/' };
      const result = await getRegistryStatus(registry, 'example-package');

      expect(result.status).toBe('taken');
      expect(result.packageName).toBe('example-package');
      expect(result.registry.id).toBe('npm');
    });

    it('should return "available" for not found responses (status 404)', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ error: 'Not found' }),
      });

      const registry = { id: 'npm', name: 'npm', apiEndpoint: 'https://registry.npmjs.org/' };
      const result = await getRegistryStatus(registry, 'nonexistent-package');

      expect(result.status).toBe('available');
    });

    it('should return "error" for other error responses', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Server error' }),
      });

      const registry = { id: 'npm', name: 'npm', apiEndpoint: 'https://registry.npmjs.org/' };
      const result = await getRegistryStatus(registry, 'problematic-package');

      expect(result.status).toBe('error');
    });

    it('should handle timeout correctly', async () => {
      (global.fetch as jest.Mock).mockImplementationOnce(() => {
        return new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Timeout')), 10000);
        });
      });

      const registry = { id: 'npm', name: 'npm', apiEndpoint: 'https://registry.npmjs.org/' };

      await expect(getRegistryStatus(registry, 'test-package', 5000)).rejects.toThrow('Timeout');
    });
  });

  describe('checkPackageName', () => {
    it('should check all registries and return results', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({ name: 'existing-package' }),
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 404,
          json: async () => ({ error: 'Not found' }),
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 404,
          json: async () => ({ error: 'Not found' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({ full_name: 'user/repo' }),
        });

      const registries = [
        { id: 'npm', name: 'npm', apiEndpoint: 'https://registry.npmjs.org/' },
        { id: 'pypi', name: 'PyPI', apiEndpoint: 'https://pypi.org/pypi/' },
        { id: 'cargo', name: 'Cargo', apiEndpoint: 'https://crates.io/api/v1/crates/' },
        { id: 'github', name: 'GitHub', apiEndpoint: 'https://api.github.com/repos/' },
      ];

      const results = await checkPackageName('test-package', { registries });

      expect(results).toHaveLength(4);
      expect(results[0].status).toBe('taken'); // npm
      expect(results[1].status).toBe('available'); // pypi
      expect(results[2].status).toBe('available'); // cargo
      expect(results[3].status).toBe('taken'); // github
    });
  });
});
