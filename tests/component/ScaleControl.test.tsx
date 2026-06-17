import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ScaleControl } from "@/components/ScaleControl";
import { TooltipProvider } from "@/components/ui/tooltip";

function renderControl(value: number) {
  return render(
    <TooltipProvider>
      <ScaleControl value={value} onChange={() => {}} />
    </TooltipProvider>,
  );
}

describe("ScaleControl", () => {
  it("shows the label and a formatted value", () => {
    renderControl(1);
    expect(screen.getByText("Quality / scale")).toBeInTheDocument();
    expect(screen.getByText(/1\.00 · 100%/)).toBeInTheDocument();
  });

  it("renders an accessible slider", () => {
    renderControl(0.5);
    expect(screen.getByRole("slider")).toBeInTheDocument();
    expect(screen.getByText(/0\.50 · 50%/)).toBeInTheDocument();
  });
});
