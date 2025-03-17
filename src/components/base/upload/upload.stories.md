import { Meta, Story, Canvas, ArgsTable } from '@storybook/addon-docs';
<!-- import Upload from './Upload'; -->
import Upload from "./drag-and-drop-claude-no-loading";
import * as UploadStories from './Upload.stories';

<Meta title="Components/Upload/Documentation" component={Upload} />

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

## Import

```jsx
import Upload from './components/Upload';
```

## Props

<ArgsTable of={Upload} />

## Examples

### Basic Usage

<Canvas>
  <Story story={UploadStories.Basic} />
</Canvas>

### Image Upload Only

<Canvas>
  <Story story={UploadStories.ImageUpload} />
</Canvas>

### With File Size Limit

<Canvas>
  <Story story={UploadStories.SizeLimit} />
</Canvas>

### Multiple File Upload

<Canvas>
  <Story story={UploadStories.MultipleFiles} />
</Canvas>

### Complete Example

<Canvas>
  <Story story={UploadStories.Complete} />
</Canvas>

## Usage Examples

### Basic Usage

```jsx
import React from 'react';
import Upload from './components/Upload';

const BasicExample = () => {
  const handleFileSelect = (files) => {
    console.log('Selected files:', files);
  };

  return <Upload onFileSelect={handleFileSelect} />;
};

export default BasicExample;
```

### With File Type Restrictions

```jsx
import React from 'react';
import Upload from './components/Upload';

const ImageUploadExample = () => {
  const handleFileSelect = (files) => {
    console.log('Selected images:', files);
  };

  return (
    <Upload 
      accept=".jpg, .jpeg, .png, .gif" 
      onFileSelect={handleFileSelect} 
    />
  );
};

export default ImageUploadExample;
```

### With File Size Limit

```jsx
import React from 'react';
import Upload from './components/Upload';

const LimitedSizeExample = () => {
  // 5MB limit
  const maxSize = 5 * 1024 * 1024;

  const handleFileSelect = (files) => {
    console.log('Selected files:', files);
  };

  return (
    <Upload 
      maxSize={maxSize} 
      onFileSelect={handleFileSelect} 
    />
  );
};

export default LimitedSizeExample;
```

## Styling

The component uses `@emotion/styled` for styling and can be customized by modifying the styled components in the source file:

- `UploadContainer` - Main container for the upload component
- `DropZone` - The drag and drop area
- `IconContainer` - Container for the upload icon
- `UploadText` - Container for the upload text
- `FilesList` - Container for the list of uploaded files
- `FileItem` - Container for each uploaded file item
- `FilePreview` - Container for the file preview
- `FileInfo` - Container for the file information
- `ActionButton` - Button for file actions
- `HiddenInput` - Hidden file input element

## Accessibility

The component is designed with accessibility in mind:
- Interactive elements use semantic HTML
- Visual state changes provide feedback during interactions
- File removal buttons are properly labeled and styled for focus states