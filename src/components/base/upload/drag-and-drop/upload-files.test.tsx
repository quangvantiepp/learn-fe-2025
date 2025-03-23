import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import UploadFiles from "./upload-files";
import { FileItem } from "./upload-base";

// Mock các dependencies
vi.mock("./upload-base", () => ({
  default: ({
    onChange,
    fileList,
    ...props
  }: {
    onChange: (files: FileItem[]) => void;
    fileList: FileItem[];
  }) => (
    <input
      type="file"
      data-testid="mock-upload"
      onChange={(e) => {
        const files = e.target.files;
        if (files) {
          const fileItems = Array.from(files).map((file) => ({
            id: crypto.randomUUID(),
            file,
            preview: file.type.startsWith("image/")
              ? URL.createObjectURL(file)
              : undefined,
          }));
          onChange([...fileList, ...fileItems]);
        }
      }}
      {...props}
    />
  ),
}));

// Mock URL.createObjectURL và URL.revokeObjectURL
const mockRevokeObjectURL = vi.fn();
global.URL.createObjectURL = vi.fn(() => "mock-preview-url");
global.URL.revokeObjectURL = mockRevokeObjectURL;

describe("UploadFiles Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders upload component initially", () => {
    render(<UploadFiles />);
    expect(screen.getByTestId("mock-upload")).toBeInTheDocument();
  });

  it("handles file upload and displays file list", async () => {
    const mockFile = new File(["test"], "test.png", { type: "image/png" });
    const onFileChange = vi.fn();

    render(<UploadFiles onFileChange={onFileChange} />);
    const input = screen.getByTestId("mock-upload");

    await fireEvent.change(input, {
      target: { files: [mockFile] },
    });

    expect(screen.getByText("test.png")).toBeInTheDocument();
    expect(screen.getByText("4 Bytes")).toBeInTheDocument();
    expect(onFileChange).toHaveBeenCalledWith([mockFile], false);
  });

  it("displays stats correctly", async () => {
    const mockFile = new File(["test"], "test.png", { type: "image/png" });
    render(<UploadFiles />);
    const input = screen.getByTestId("mock-upload");

    await fireEvent.change(input, {
      target: { files: [mockFile] },
    });

    expect(screen.getByText("1 file uploaded")).toBeInTheDocument();
  });

  it("clears all files when clear all button is clicked", async () => {
    const mockFile = new File(["test"], "test.png", { type: "image/png" });
    render(<UploadFiles />);
    const input = screen.getByTestId("mock-upload");

    await fireEvent.change(input, {
      target: { files: [mockFile] },
    });

    const clearButton = screen.getByText("Clear all");
    await fireEvent.click(clearButton);

    expect(screen.queryByText("test.png")).not.toBeInTheDocument();
    expect(mockRevokeObjectURL).toHaveBeenCalled();
  });

  it("respects maxSize prop", async () => {
    const largeFile = new File(["test"], "large.png", { type: "image/png" });
    Object.defineProperty(largeFile, "size", { value: 1024 * 1024 * 2 });

    const onFileChange = vi.fn();
    render(<UploadFiles maxSize={1000} onFileChange={onFileChange} />);
    const input = screen.getByTestId("mock-upload");

    await fireEvent.change(input, {
      target: { files: [largeFile] },
    });

    expect(screen.getByText(/large.png/i)).toBeInTheDocument();
    expect(onFileChange).toHaveBeenCalledTimes(2);
  });

  it("handles multiple files when multiple prop is true", async () => {
    const mockFile1 = new File(["test1"], "test1.png", { type: "image/png" });
    const mockFile2 = new File(["test2"], "test2.png", { type: "image/png" });

    render(<UploadFiles multiple />);
    const input = screen.getByTestId("mock-upload");

    await fireEvent.change(input, {
      target: { files: [mockFile1, mockFile2] },
    });

    expect(screen.getByText("test1.png")).toBeInTheDocument();
    expect(screen.getByText("test2.png")).toBeInTheDocument();
    expect(screen.getByText("2 files uploaded")).toBeInTheDocument();
  });

  it("cleans up preview URLs on unmount", () => {
    const mockFile = new File(["test"], "test.png", { type: "image/png" });
    const { unmount } = render(<UploadFiles />);
    const input = screen.getByTestId("mock-upload");

    fireEvent.change(input, {
      target: { files: [mockFile] },
    });

    unmount();
    expect(mockRevokeObjectURL).toHaveBeenCalledWith("mock-preview-url");
  });
});
