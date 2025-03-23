// stories/Upload.stories.tsx
import React, { useState } from "react";
import { Meta, StoryObj } from "@storybook/react";
import Upload, { FileItem} from "./upload-files"; // Điều chỉnh đường dẫn theo cấu trúc dự án của bạn

// Metadata cho Storybook
const meta: Meta<typeof Upload> = {
  title: "Components/Upload",
  component: Upload,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    type: {
      control: "select",
      options: ["drag-and-drop", "button"],
      description: "Type of upload interface",
    },
    multiple: {
      control: "boolean",
      description: "Allow multiple file selection",
    },
    accept: {
      control: "text",
      description: 'Accepted file types (e.g., "image/*, .pdf")',
    },
    maxSize: {
      control: "number",
      description: "Maximum file size in bytes",
    },
    maxCount: {
      control: "number",
      description: "Maximum number of files allowed",
    },
    bnt: {
      control: "object",
      description: "Button configuration (only for button type)",
    },
  },
};

export default meta;

type Story = StoryObj<typeof Upload>;

// Template component để quản lý state trong stories
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
                {file.file.name} ({file.file.size} bytes)
                {file.isError && ` - Error: ${file.errorMessage}`}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

// Story mặc định
export const Default: Story = {
  render: (args) => <UploadTemplate {...args} />,
  args: {
    type: "drag-and-drop",
    multiple: false,
    fileList: [],
  },
  name: "Drag and Drop (Default)",
};

// Story cho loại Button
export const ButtonType: Story = {
  render: (args) => <UploadTemplate {...args} />,
  args: {
    type: "button",
    bnt: { label: "Upload Files" },
    multiple: false,
    fileList: [],
  },
  name: "Button Type",
};

// Story với Multiple Files
export const MultipleFiles: Story = {
  render: (args) => <UploadTemplate {...args} />,
  args: {
    type: "drag-and-drop",
    multiple: true,
    maxCount: 3,
    fileList: [],
  },
  name: "Multiple Files",
};

// Story với giới hạn file type
export const RestrictedFileTypes: Story = {
  render: (args) => <UploadTemplate {...args} />,
  args: {
    type: "drag-and-drop",
    accept: "image/png, image/jpeg",
    multiple: true,
    fileList: [],
  },
  name: "Restricted File Types",
};

// Story với giới hạn kích thước
export const SizeLimit: Story = {
  render: (args) => <UploadTemplate {...args} />,
  args: {
    type: "drag-and-drop",
    maxSize: 1024 * 1024, // 1MB
    multiple: false,
    fileList: [],
  },
  name: "Size Limit (1MB)",
};

// Story với tất cả các giới hạn
export const FullRestrictions: Story = {
  render: (args) => <UploadTemplate {...args} />,
  args: {
    type: "drag-and-drop",
    multiple: true,
    accept: "image/*",
    maxSize: 1024 * 1024, // 1MB
    maxCount: 2,
    fileList: [],
  },
  name: "Full Restrictions",
};
