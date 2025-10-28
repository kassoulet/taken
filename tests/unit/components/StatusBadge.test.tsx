import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import StatusBadge from "../../../src/components/StatusBadge";

describe("StatusBadge Component", () => {
  it("renders available status with correct styling", () => {
    render(<StatusBadge status="available" registryName="npm" />);
    const badge = screen.getByText(/available/i);
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass("text-green-800");
  });

  it("renders taken status with correct styling", () => {
    render(<StatusBadge status="taken" registryName="npm" />);
    const badge = screen.getByText(/taken/i);
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass("text-yellow-800");
  });

  it("renders error status with correct styling", () => {
    render(<StatusBadge status="error" registryName="npm" />);
    const badge = screen.getByText(/error/i);
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass("text-red-800");
  });

  it("shows registry name", () => {
    render(<StatusBadge status="available" registryName="PyPI" />);
    const registryName = screen.getByText(/PyPI/i);
    expect(registryName).toBeInTheDocument();
  });

  it("displays loading state", () => {
    render(
      <StatusBadge status="available" registryName="npm" loading={true} />,
    );
    const spinner = screen.getByRole("status");
    expect(spinner).toBeInTheDocument();
  });
});
