import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import RegistryStatusGrid from "../../../src/components/RegistryStatusGrid";

describe("RegistryStatusGrid Component", () => {
  const mockRegistryStatuses = [
    {
      registry: {
        id: "npm",
        name: "npm",
        apiEndpoint: "https://registry.npmjs.org/",
      },
      packageName: "test-package",
      status: "available" as const,
      timestamp: new Date().toISOString(),
    },
    {
      registry: {
        id: "pypi",
        name: "PyPI",
        apiEndpoint: "https://pypi.org/pypi/",
      },
      packageName: "test-package",
      status: "taken" as const,
      timestamp: new Date().toISOString(),
    },
  ];

  it("renders all registry statuses", () => {
    render(
      <RegistryStatusGrid
        packageName="test-package"
        registryStatuses={mockRegistryStatuses}
        loading={false}
      />,
    );

    expect(screen.getByText(/npm/i)).toBeInTheDocument();
    expect(screen.getByText(/pypi/i)).toBeInTheDocument();
  });

  it("shows loading state", () => {
    render(
      <RegistryStatusGrid
        packageName="test-package"
        registryStatuses={[]}
        loading={true}
      />,
    );

    expect(screen.getByText(/checking registries/i)).toBeInTheDocument();
  });

  it("shows error when present", () => {
    render(
      <RegistryStatusGrid
        packageName="test-package"
        registryStatuses={mockRegistryStatuses}
        loading={false}
        error="Network error"
      />,
    );

    expect(screen.getByText(/network error/i)).toBeInTheDocument();
  });
});
