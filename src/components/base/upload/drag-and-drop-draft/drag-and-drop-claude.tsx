import React, { useState, useRef, useCallback } from "react";
import styled from "@emotion/styled";
import {
  CrossCircledIcon,
  UploadIcon,
  CheckCircledIcon,
  TrashIcon,
} from "@radix-ui/react-icons";

// Types
interface FileItem {
  id: string;
  file: File;
  preview?: string;
  progress: number;
  status: "uploading" | "success" | "error";
}

interface FileUploaderProps {
  multiple?: boolean;
  accept?: string;
  maxSize?: number; // in bytes
  onFilesAdded?: (files: File[]) => void;
  onFileRemove?: (fileId: string) => void;
}

// Styled Components
const UploadContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
`;

const DropZone = styled.div<{ isDragActive: boolean }>`
  border: 2px dashed ${(props) => (props.isDragActive ? "#7c3aed" : "#e5e7eb")};
  border-radius: 8px;
  padding: 40px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background-color: ${(props) =>
    props.isDragActive ? "rgba(124, 58, 237, 0.05)" : "#fafafa"};
  transition: all 0.2s ease;

  &:hover {
    border-color: #7c3aed;
    background-color: rgba(124, 58, 237, 0.05);
  }
`;

const IconContainer = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
`;

const UploadText = styled.div`
  text-align: center;

  h3 {
    margin: 0 0 8px 0;
    font-size: 16px;
    font-weight: 600;
    color: #111827;
  }

  p {
    margin: 0;
    font-size: 14px;
    color: #6b7280;
  }
`;

const FilesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 300px;
  overflow-y: auto;
`;

const FileItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  border-radius: 6px;
  background-color: #f9fafb;
  border: 1px solid #f3f4f6;
`;

const FilePreview = styled.div<{ bgImage?: string }>`
  width: 40px;
  height: 40px;
  border-radius: 4px;
  background-color: #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  font-weight: 600;
  color: #6b7280;
  font-size: 12px;
  ${(props) =>
    props.bgImage
      ? `background-image: url(${props.bgImage}); background-size: cover;`
      : ""}
`;

const FileInfo = styled.div`
  flex: 1;

  .file-name {
    font-size: 14px;
    font-weight: 500;
    color: #111827;
    margin-bottom: 4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 300px;
  }

  .file-size {
    font-size: 12px;
    color: #6b7280;
  }
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 4px;
  background-color: #e5e7eb;
  border-radius: 2px;
  margin-top: 6px;
`;

const ProgressFill = styled.div<{ progress: number; status: string }>`
  height: 100%;
  border-radius: 2px;
  width: ${(props) => `${props.progress}%`};
  background-color: ${(props) =>
    props.status === "error" ? "#ef4444" : "#7c3aed"};
  transition: width 0.3s ease;
`;

const StatusIcon = styled.div<{ status: string }>`
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${(props) =>
    props.status === "success"
      ? "#10b981"
      : props.status === "error"
      ? "#ef4444"
      : "#6b7280"};
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  color: #6b7280;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;

  &:hover {
    background-color: #f3f4f6;
    color: #111827;
  }
`;

const HiddenInput = styled.input`
  display: none;
`;

// Utility Functions
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";

  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${parseFloat((bytes / Math.pow(1024, i)).toFixed(2))} ${sizes[i]}`;
};

const getFileExtension = (fileName: string): string => {
  return fileName.split(".").pop() || "";
};

// Main Component
const FileUploaderClaude: React.FC<FileUploaderProps> = ({
  multiple = false,
  accept,
  maxSize,
  onFilesAdded,
  onFileRemove,
}) => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isDragActive, setIsDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const processFiles = useCallback(
    (fileList: FileList) => {
      const newFiles: File[] = [];
      const newFileItems: FileItem[] = [];

      Array.from(fileList).forEach((file) => {
        if (maxSize && file.size > maxSize) {
          console.warn(`File ${file.name} exceeds maximum size limit`);
          return;
        }

        newFiles.push(file);

        const fileId = `${file.name}-${Date.now()}`;
        const newFile: FileItem = {
          id: fileId,
          file,
          progress: 0,
          status: "uploading",
        };

        if (file.type.startsWith("image/")) {
          newFile.preview = URL.createObjectURL(file);
        }

        newFileItems.push(newFile);
      });

      if (newFiles.length > 0) {
        setFiles((prev) => [...prev, ...newFileItems]);

        if (onFilesAdded) {
          onFilesAdded(newFiles);
        }

        // Simulate upload process for each file
        newFileItems.forEach((fileItem) => {
          simulateUpload(fileItem.id);
        });
      }
    },
    [maxSize, onFilesAdded]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        processFiles(e.dataTransfer.files);
      }
    },
    [processFiles]
  );

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        processFiles(e.target.files);
        if (inputRef.current) {
          inputRef.current.value = "";
        }
      }
    },
    [processFiles]
  );

  const openFileDialog = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  const simulateUpload = (fileId: string) => {
    let progress = 0;
    const intervalId = setInterval(() => {
      progress += Math.random() * 10;

      if (progress >= 100) {
        progress = 100;
        clearInterval(intervalId);

        setFiles((prev) =>
          prev.map((file) =>
            file.id === fileId
              ? {
                  ...file,
                  progress,
                  status: Math.random() > 0.2 ? "success" : "error",
                }
              : file
          )
        );
      } else {
        setFiles((prev) =>
          prev.map((file) =>
            file.id === fileId ? { ...file, progress } : file
          )
        );
      }
    }, 300);
  };

  const handleRemoveFile = (fileId: string) => {
    setFiles((prev) => {
      const updatedFiles = prev.filter((file) => file.id !== fileId);
      const removedFile = prev.find((file) => file.id === fileId);

      if (removedFile?.preview) {
        URL.revokeObjectURL(removedFile.preview);
      }

      if (onFileRemove) {
        onFileRemove(fileId);
      }

      return updatedFiles;
    });
  };

  const getFilePreview = (file: FileItem) => {
    if (file.preview) {
      return <FilePreview bgImage={file.preview} />;
    }

    const ext = getFileExtension(file.file.name);
    return <FilePreview>{ext.toUpperCase()}</FilePreview>;
  };

  return (
    <UploadContainer>
      <DropZone
        isDragActive={isDragActive}
        onClick={openFileDialog}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <IconContainer>
          <UploadIcon width={24} height={24} />
        </IconContainer>
        <UploadText>
          <h3>Upload files</h3>
          <p>Drag and drop files here or click to browse</p>
          {accept && <p>Accepted file types: {accept}</p>}
          {maxSize && <p>Maximum file size: {formatFileSize(maxSize)}</p>}
        </UploadText>
      </DropZone>

      <HiddenInput
        ref={inputRef}
        type="file"
        multiple={multiple}
        accept={accept}
        onChange={handleFileInputChange}
      />

      {files.length > 0 && (
        <FilesList>
          {files.map((file) => (
            <FileItem key={file.id}>
              {getFilePreview(file)}

              <FileInfo>
                <div className="file-name">{file.file.name}</div>
                <div className="file-size">
                  {formatFileSize(file.file.size)}
                </div>
                <ProgressBar>
                  <ProgressFill progress={file.progress} status={file.status} />
                </ProgressBar>
              </FileInfo>

              <StatusIcon status={file.status}>
                {file.status === "uploading" ? (
                  <span>{Math.floor(file.progress)}%</span>
                ) : file.status === "success" ? (
                  <CheckCircledIcon width={16} height={16} />
                ) : (
                  <CrossCircledIcon width={16} height={16} />
                )}
              </StatusIcon>

              <ActionButton onClick={() => handleRemoveFile(file.id)}>
                <TrashIcon width={16} height={16} color="#ef4444" />
              </ActionButton>
            </FileItem>
          ))}
        </FilesList>
      )}
    </UploadContainer>
  );
};

export default FileUploaderClaude;

// Example usage in another component:
/* 
import FileUploader from './FileUploader';

const MyForm = () => {
  const handleFilesAdded = (files: File[]) => {
    console.log('Files added:', files);
    // Send files to your backend or process them
  };

  return (
    <div>
      <h2>Upload Documents</h2>
      <FileUploader 
        multiple 
        accept="image/*,application/pdf"
        maxSize={5 * 1024 * 1024} // 5MB
        onFilesAdded={handleFilesAdded}
      />
    </div>
  );
};
*/
