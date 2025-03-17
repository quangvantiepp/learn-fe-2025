import React from "react";
import Upload from "./upload-claude-no-loading";

export default {
  title: "Components/Upload",
  component: Upload,
  parameters: {
    docs: {
      description: {
        component: `
# Upload Component

A flexible and user-friendly file upload component that supports drag-and-drop functionality, file previews, and multiple file selection.

## Features

- Drag and drop file uploads
- Click to browse functionality
- File type validation
- Maximum file size validation
- Image preview for image files
- File extension display for non-image files
- Multiple file selection (optional)
- File removal
        `,
      },
    },
  },
  argTypes: {
    multiple: {
      control: "boolean",
      description: "Allows multiple file selection when set to true",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    accept: {
      control: "text",
      description:
        "Specifies the file types that can be uploaded (e.g., .jpg, .png, .pdf)",
      table: {
        type: { summary: "string" },
      },
    },
    maxSize: {
      control: "number",
      description: "Maximum file size in bytes",
      table: {
        type: { summary: "number" },
      },
    },
    onFileSelect: {
      action: "files selected",
      description:
        "Callback function that is called when files are selected, receives an array of File objects",
      table: {
        type: { summary: "function" },
      },
    },
    onFileRemove: {
      action: "file removed",
      description:
        "Callback function that is called when a file is removed, receives the file ID",
      table: {
        type: { summary: "function" },
      },
    },
  },
};

// Basic story
export const Basic = () => (
  <Upload onFileSelect={(files) => console.log("Files selected:", files)} />
);
Basic.parameters = {
  docs: {
    description: {
      story: "Basic usage of the Upload component with default settings.",
    },
  },
};

// Image upload only
export const ImageUpload = () => (
  <Upload
    accept=".jpg, .jpeg, .png, .gif"
    onFileSelect={(files) => console.log("Images selected:", files)}
  />
);
ImageUpload.parameters = {
  docs: {
    description: {
      story: "Upload component configured to accept only image files.",
    },
  },
};

// With file size limit
export const SizeLimit = () => (
  <Upload
    maxSize={5 * 1024 * 1024} // 5MB
    onFileSelect={(files) => console.log("Files selected:", files)}
  />
);
SizeLimit.parameters = {
  docs: {
    description: {
      story: "Upload component with a 5MB file size limit.",
    },
  },
};

// Multiple file upload
export const MultipleFiles = () => (
  <Upload
    multiple={true}
    onFileSelect={(files) => console.log("Files selected:", files)}
  />
);
MultipleFiles.parameters = {
  docs: {
    description: {
      story: "Upload component configured to accept multiple files.",
    },
  },
};

// Complete example with all props
export const Complete = (args: any) => <Upload {...args} />;
Complete.args = {
  multiple: true,
  accept: ".jpg, .jpeg, .png, .pdf, .docx",
  maxSize: 10 * 1024 * 1024, // 10MB
};
Complete.parameters = {
  docs: {
    description: {
      story: "Complete example with all available props configured.",
    },
  },
};

// Code example
export const CodeExample = () => <Upload />;
CodeExample.parameters = {
  docs: {
    source: {
      code: `
import React from 'react';
import Upload from './components/Upload';

const CompleteExample = () => {
  // 10MB limit
  const maxSize = 10 * 1024 * 1024;

  const handleFileSelect = (files) => {
    console.log('Selected files:', files);
  };

  const handleFileRemove = (fileId) => {
    console.log('Removed file with ID:', fileId);
  };

  return (
    <Upload 
      multiple={true} 
      accept=".jpg, .jpeg, .png, .pdf, .docx" 
      maxSize={maxSize} 
      onFileSelect={handleFileSelect} 
      onFileRemove={handleFileRemove} 
    />
  );
};

export default CompleteExample;
      `,
      language: "jsx",
      type: "auto",
    },
  },
};
