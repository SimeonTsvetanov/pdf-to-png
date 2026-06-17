import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Dropzone } from "@/components/Dropzone";

function getFileInput(container: HTMLElement): HTMLInputElement {
  const input = container.querySelector<HTMLInputElement>('input[type="file"]');
  if (!input) throw new Error("file input not found");
  return input;
}

describe("Dropzone", () => {
  it("renders the call-to-action", () => {
    render(<Dropzone onFile={() => {}} />);
    expect(screen.getByText(/Drop a PDF here/i)).toBeInTheDocument();
  });

  it("calls onFile for a PDF", () => {
    const onFile = vi.fn();
    const { container } = render(<Dropzone onFile={onFile} />);
    const file = new File(["%PDF-1.7"], "doc.pdf", { type: "application/pdf" });
    fireEvent.change(getFileInput(container), { target: { files: [file] } });
    expect(onFile).toHaveBeenCalledWith(file);
  });

  it("calls onInvalid for a non-PDF", () => {
    const onFile = vi.fn();
    const onInvalid = vi.fn();
    const { container } = render(<Dropzone onFile={onFile} onInvalid={onInvalid} />);
    const file = new File(["hi"], "note.txt", { type: "text/plain" });
    fireEvent.change(getFileInput(container), { target: { files: [file] } });
    expect(onFile).not.toHaveBeenCalled();
    expect(onInvalid).toHaveBeenCalledOnce();
  });
});
