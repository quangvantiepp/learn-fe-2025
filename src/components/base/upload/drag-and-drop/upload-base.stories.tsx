// stories/Upload.stories.tsx
import React, { useState } from "react";
import { Meta } from "@storybook/react";
import Upload, { FileItem, UploadProps } from "./upload-base"; // Điều chỉnh đường dẫn theo cấu trúc dự án của bạn
import { formatFileSize } from "./upload-base";

// Metadata với mô tả chi tiết và controls
export default {
  title: "Components/Upload",
  component: Upload,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
          **Upload Component**  
          A versatile file upload component that supports both drag-and-drop and button-based file selection. It provides validation for file types, size, count, and duplicates, with visual feedback for drag states.

          ### Features:
          - **Upload Types**: Supports "drag-and-drop" (default) or "button" interfaces.
          - **Multiple Files**: Allows multiple file uploads when \`multiple\` is enabled.
          - **File Validation**: 
            - Checks file types against \`accept\` (e.g., "image/*", ".pdf").
            - Enforces maximum file size with \`maxSize\` (in bytes).
            - Limits total number of files with \`maxCount\`.
            - Prevents duplicate files based on name and size.
          - **Preview**: Generates preview URLs for image files using \`URL.createObjectURL\`.
          - **Drag Feedback**: Visual indication when files are dragged over the drop zone.
          - **Error Handling**: Returns validation errors for invalid files (type, size, duplicates, empty files).

          ### Usage:
          \`\`\`tsx
          const [files, setFiles] = useState<FileItem[]>([]);
          const handleChange = (totalFiles: FileItem[], newFiles: FileItem[]) => setFiles(totalFiles);
          <Upload type="drag-and-drop" multiple accept="image/*" maxSize={1024 * 1024} fileList={files} onChange={handleChange} />
          \`\`\`
        `,
      },
    },
  },
  // Thêm controls thông qua argTypes
  argTypes: {
    type: {
      control: { type: "select" },
      options: ["drag-and-drop", "button"],
      description: "Type of upload interface",
    },
    multiple: {
      control: { type: "boolean" },
      description: "Allow multiple file uploads",
    },
    accept: {
      control: { type: "text" },
      description: 'Accepted file types (e.g., "image/*, .pdf")',
    },
    maxSize: {
      control: { type: "number" },
      description: "Maximum file size in bytes",
    },
    maxCount: {
      control: { type: "number" },
      description: "Maximum number of files allowed",
    },
    bnt: {
      control: { type: "object" },
      description: "Button configuration (only for button type)",
    },
  },
} as Meta;

// Template component để quản lý state
const UploadTemplate: React.FC<UploadProps> = (args) => {
  const [fileList, setFileList] = useState<FileItem[]>([]);

  const handleFileChange = (
    totalSelectFiles: FileItem[],
    selectedFiles: FileItem[]
  ) => {
    setFileList(totalSelectFiles);
    console.log("Selected files:", selectedFiles);
  };

  return (
    <div style={{ width: "400px" }}>
      <Upload {...args} fileList={fileList} onChange={handleFileChange} />
      {fileList.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <h4>Selected Files:</h4>
          <ul>
            {fileList.map((file) => (
              <li key={file.id}>
                {file.file.name} ({formatFileSize(file.file.size)})
                {file.isError && ` - Error: ${file.errorMessage}`}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

// Các ví dụ cơ bản với giá trị mặc định cho controls
export const Default = (args: UploadProps) => <UploadTemplate {...args} />;
Default.args = {
  type: "drag-and-drop",
  fileList: [],
};
Default.parameters = {
  docs: {
    description: {
      story:
        "Basic drag-and-drop upload interface. Allows single file upload by default.",
    },
  },
};

export const ButtonType = (args: UploadProps) => <UploadTemplate {...args} />;
ButtonType.args = {
  type: "button",
  bnt: { label: "Upload Files" },
  fileList: [],
};
ButtonType.parameters = {
  docs: {
    description: {
      story:
        "Button-based upload interface. Clicking the button opens the file picker.",
    },
  },
};

export const MultipleFiles = (args: UploadProps) => (
  <UploadTemplate {...args} />
);
MultipleFiles.args = {
  type: "drag-and-drop",
  multiple: true,
  maxCount: 3,
  fileList: [],
};
MultipleFiles.parameters = {
  docs: {
    description: {
      story:
        "Allows multiple file uploads with a maximum limit of 3 files (`maxCount=3`). Displays an alert if limit is exceeded.",
    },
  },
};

export const RestrictedFileTypes = (args: UploadProps) => (
  <UploadTemplate {...args} />
);
RestrictedFileTypes.args = {
  type: "drag-and-drop",
  accept: "image/png, image/jpeg",
  multiple: true,
  fileList: [],
};
RestrictedFileTypes.parameters = {
  docs: {
    description: {
      story:
        'Restricts uploads to PNG and JPEG images only (`accept="image/png, image/jpeg"`). Invalid files are marked with an error.',
    },
  },
};

export const SizeLimit = (args: UploadProps) => <UploadTemplate {...args} />;
SizeLimit.args = {
  type: "drag-and-drop",
  maxSize: 1024 * 1024, // 1MB
  fileList: [],
};
SizeLimit.parameters = {
  docs: {
    description: {
      story:
        "Limits file size to 1MB (`maxSize=1024 * 1024`). Files exceeding this limit are marked as errors.",
    },
  },
};

export const FullRestrictions = (args: UploadProps) => (
  <UploadTemplate {...args} />
);
FullRestrictions.args = {
  type: "drag-and-drop",
  multiple: true,
  accept: "image/*",
  maxSize: 1024 * 1024, // 1MB
  maxCount: 2,
  fileList: [],
};
FullRestrictions.parameters = {
  docs: {
    description: {
      story:
        'Combines all restrictions: multiple files, accepts only images (`accept="image/*"`), max size 1MB, and max 2 files.',
    },
  },
};
