import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import Upload from "./drag-and-drop-claude-base"; // Adjust the import path as needed

// Mock createObjectURL and revokeObjectURL
global.URL.createObjectURL = vi.fn(() => "mock-object-url");
global.URL.revokeObjectURL = vi.fn();

// Helper function to create mock files
const createMockFile = (name: string, size: number, type: string) => {
  const file = new File([], name, { type });
  Object.defineProperty(file, "size", { value: size });
  return file;
};

describe("Upload Component", () => {
  const onFileSelectMock = vi.fn();
  const onFileRemoveMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders correctly with default props", () => {
    render(<Upload />);

    expect(screen.getByText("Upload files")).toBeInTheDocument();
    expect(
      screen.getByText("Drag and drop files here or click to browse")
    ).toBeInTheDocument();
    expect(screen.queryByText("Accepted file types:")).not.toBeInTheDocument();
    expect(screen.queryByText("Maximum file size:")).not.toBeInTheDocument();
  });

  it("displays accept and maxSize information when provided", () => {
    render(<Upload accept=".jpg,.png" maxSize={5242880} />);

    expect(
      screen.getByText("Accepted file types: .jpg,.png")
    ).toBeInTheDocument();
    expect(screen.getByText("Maximum file size: 5 MB")).toBeInTheDocument();
  });

  it("handles file selection via input change", async () => {
    render(<Upload multiple={true} onFileSelect={onFileSelectMock} />);

    const file = createMockFile("test.pdf", 1024, "application/pdf");
    const input = screen.getByDisplayValue("") as HTMLInputElement;

    // Mock the file input change
    Object.defineProperty(input, "files", {
      value: [file],
    });

    fireEvent.change(input);

    await waitFor(() => {
      expect(onFileSelectMock).toHaveBeenCalledWith([file]);
      expect(screen.getByText("test.pdf")).toBeInTheDocument();
      expect(screen.getByText("1 KB")).toBeInTheDocument();
    });
  });

  it("handles image files and creates preview", async () => {
    render(<Upload />);

    const imageFile = createMockFile("image.jpg", 2048, "image/jpeg");
    const input = screen.getByDisplayValue("") as HTMLInputElement;

    // Mock the file input change
    Object.defineProperty(input, "files", {
      value: [imageFile],
    });

    fireEvent.change(input);

    await waitFor(() => {
      expect(global.URL.createObjectURL).toHaveBeenCalledWith(imageFile);
      expect(screen.getByText("image.jpg")).toBeInTheDocument();
    });
  });

  it("respects maxSize and filters out files exceeding it", async () => {
    const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    render(<Upload maxSize={1000} onFileSelect={onFileSelectMock} />);

    const smallFile = createMockFile("small.txt", 500, "text/plain");
    const largeFile = createMockFile("large.txt", 1500, "text/plain");

    const input = screen.getByDisplayValue("") as HTMLInputElement;

    // Mock the file input change with both files
    Object.defineProperty(input, "files", {
      value: [smallFile, largeFile],
    });

    fireEvent.change(input);

    await waitFor(() => {
      // Only the small file should be processed
      expect(onFileSelectMock).toHaveBeenCalledWith([smallFile]);
      expect(screen.getByText("small.txt")).toBeInTheDocument();
      expect(screen.queryByText("large.txt")).not.toBeInTheDocument();
      expect(consoleSpy).toHaveBeenCalledWith(
        "File large.txt exceeds maximum size limit"
      );
    });

    consoleSpy.mockRestore();
  });

  it("handles file removal", async () => {
    render(
      <Upload onFileSelect={onFileSelectMock} onFileRemove={onFileRemoveMock} />
    );

    const file = createMockFile("test.pdf", 1024, "application/pdf");
    const input = screen.getByDisplayValue("") as HTMLInputElement;

    // Add file
    Object.defineProperty(input, "files", {
      value: [file],
    });

    fireEvent.change(input);

    await waitFor(() => {
      expect(screen.getByText("test.pdf")).toBeInTheDocument();
    });

    // Remove file
    const removeButton = screen.getByRole("button");
    fireEvent.click(removeButton);

    await waitFor(() => {
      expect(screen.queryByText("test.pdf")).not.toBeInTheDocument();
      expect(onFileRemoveMock).toHaveBeenCalled();
    });
  });

  it("handles drag and drop operations", async () => {
    render(<Upload onFileSelect={onFileSelectMock} />);

    const dropzone =
      screen.getByText("Upload files").parentElement?.parentElement;
    expect(dropzone).toBeInTheDocument();

    // Drag enter
    fireEvent.dragEnter(dropzone!);
    expect(dropzone).toHaveStyle({
      backgroundColor: "rgba(124, 58, 237, 0.05)",
      borderColor: "#7c3aed",
    });

    // Drag leave
    fireEvent.dragLeave(dropzone!);
    expect(dropzone).toHaveStyle({
      backgroundColor: "#fafafa",
      borderColor: "#e5e7eb",
    });

    // Drop files
    const file = createMockFile("dropped.txt", 512, "text/plain");

    fireEvent.drop(dropzone!, {
      dataTransfer: {
        files: [file],
      },
    });

    await waitFor(() => {
      expect(onFileSelectMock).toHaveBeenCalledWith([file]);
      expect(screen.getByText("dropped.txt")).toBeInTheDocument();
    });
  });

  it("shows file extension for non-image files", async () => {
    render(<Upload />);

    const docFile = createMockFile(
      "document.docx",
      3072,
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );
    const input = screen.getByDisplayValue("") as HTMLInputElement;

    // Mock the file input change
    Object.defineProperty(input, "files", {
      value: [docFile],
    });

    fireEvent.change(input);

    await waitFor(() => {
      // Should show the DOCX extension in the file preview
      expect(screen.getByText("DOCX")).toBeInTheDocument();
      expect(screen.getByText("document.docx")).toBeInTheDocument();
    });
  });

  it("handles multiple file uploads when multiple is true", async () => {
    // We'll use component re-rendering to avoid property redefinition issues
    const { rerender } = render(
      <Upload multiple={true} onFileSelect={onFileSelectMock} />
    );

    const file1 = createMockFile("file1.txt", 1024, "text/plain");

    // First upload - use a new mocked event object
    const changeEvent1 = {
      target: {
        files: [file1],
        value: "",
      },
    };

    const input = screen.getByDisplayValue("") as HTMLInputElement;
    fireEvent.change(input, changeEvent1);

    await waitFor(() => {
      expect(screen.getByText("file1.txt")).toBeInTheDocument();
    });

    // Second upload - create a new change event instead of redefining properties
    const file2 = createMockFile("file2.pdf", 2048, "application/pdf");
    const changeEvent2 = {
      target: {
        files: [file2],
        value: "",
      },
    };

    // Re-render to make sure the component state is preserved
    rerender(<Upload multiple={true} onFileSelect={onFileSelectMock} />);

    fireEvent.change(input, changeEvent2);

    await waitFor(() => {
      // Both files should be present
      expect(screen.getByText("file1.txt")).toBeInTheDocument();
      expect(screen.getByText("file2.pdf")).toBeInTheDocument();

      // onFileSelect should have been called twice
      expect(onFileSelectMock).toHaveBeenCalledTimes(2);
    });
  });

  it("opens file dialog when clicking on the dropzone", () => {
    render(<Upload />);

    const dropzone =
      screen.getByText("Upload files").parentElement?.parentElement;

    // Mock the click method of input
    const clickSpy = vi.fn();
    HTMLInputElement.prototype.click = clickSpy;

    // Click on dropzone
    fireEvent.click(dropzone!);

    expect(clickSpy).toHaveBeenCalled();
  });
});
