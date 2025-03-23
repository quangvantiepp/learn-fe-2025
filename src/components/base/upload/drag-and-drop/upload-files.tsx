import styled from "@emotion/styled";
import {
  CheckCircledIcon,
  CrossCircledIcon,
  TrashIcon,
} from "@radix-ui/react-icons";
import React, { useEffect, useRef, useState } from "react";
import Upload from "./upload-base";

// Types
export interface FileItem {
  id: string;
  file: File;
  preview?: string;
  isError?: boolean;
  errorMessage?: string;
}

interface UploadProps {
  multiple?: boolean;
  accept?: string;
  maxSize?: number; // in bytes
  maxCount?: number;
  onFileChange?: (files: File[], isError: boolean) => void;
}

// Styled Components
const UploadContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
`;

const FilesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 300px;
  overflow-y: auto;
`;

const FileItem = styled.div<{ isError?: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  border-radius: 6px;
  background-color: ${(props) => (props.isError ? "#FEF2F2" : "#f9fafb")};
  border: 1px solid ${(props) => (props.isError ? "#FEE2E2" : "#f3f4f6")};
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

  .error-message {
    font-size: 12px;
    color: #ef4444;
    margin-top: 2px;
  }
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

// New styled components for stats and control buttons
const StatsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 12px 16px;
  background-color: #f9fafb;
  border-radius: 8px;
  border: 1px solid #f3f4f6;
  margin-top: 8px;
`;

const Stats = styled.div`
  display: flex;
  gap: 16px;
`;

const StatItem = styled.div<{ error?: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: ${(props) => (props.error ? "#ef4444" : "#111827")};
`;

const ControlButtons = styled.div`
  display: flex;
  gap: 8px;
`;

const Button = styled.button<{ variant?: string }>`
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  color: ${(props) => (props.variant === "danger" ? "white" : "#6b7280")};
  background-color: ${(props) =>
    props.variant === "danger" ? "#ef4444" : "#f3f4f6"};

  &:hover {
    background-color: ${(props) =>
      props.variant === "danger" ? "#dc2626" : "#e5e7eb"};
  }
`;

// Utility Functions
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";

  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${parseFloat((bytes / Math.pow(1024, i)).toFixed(2))} ${sizes[i]}`;
};

const getFileExtension = (fileName: string): string => {
  return fileName.split(".").pop() || "";
};

// Main Component
const UploadFiles: React.FC<UploadProps> = ({
  multiple = false,
  accept,
  maxSize,
  maxCount,
  onFileChange,
}) => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const previewUrlsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (onFileChange) {
      const isError = files.some((file) => file.isError);
      if (isError) {
        onFileChange([], isError);
      } else {
        onFileChange(
          files.map((file) => file.file),
          isError
        );
      }
    }
  }, [files]);

  useEffect(() => {
    return () => {
      previewUrlsRef.current.forEach((previewUrl) => {
        URL.revokeObjectURL(previewUrl);
      });
      console.log("Cleanup preview URLs:", previewUrlsRef.current.size);
      previewUrlsRef.current.clear();
    };
  }, []);

  const onChange = (totalSelectedFiles: FileItem[]) => {
    totalSelectedFiles.forEach((file) => {
      if (file.preview) {
        previewUrlsRef.current.add(file.preview);
      }
    });
    setFiles(totalSelectedFiles);
  };

  const revokePreviewUrl = (preview?: string) => {
    if (preview) {
      previewUrlsRef.current.delete(preview);
      URL.revokeObjectURL(preview);
    }
  };

  const handleRemoveFile = (fileId: string) => {
    setFiles((prev) => {
      const updatedFiles = prev.filter((file) => file.id !== fileId);
      const fileToRemove = prev.find((file) => file.id === fileId);

      revokePreviewUrl(fileToRemove?.preview);

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

  // File statistics
  const totalFiles = files.length;
  const errorFiles = files.filter((file) => file.isError).length;
  const successFiles = totalFiles - errorFiles;

  // New control functions
  const clearAllFiles = () => {
    files.forEach((file) => {
      revokePreviewUrl(file.preview);
    });
    setFiles([]);
  };

  const clearErrorFiles = () => {
    setFiles((prev) => {
      const validFiles = prev.filter((file) => !file.isError);

      // Revoke object URLs for files being removed
      prev.forEach((file) => {
        if (file.isError) {
          revokePreviewUrl(file.preview);
        }
      });

      return validFiles;
    });
  };

  return (
    <UploadContainer>
      <Upload
        accept={accept}
        multiple={multiple}
        maxSize={maxSize}
        maxCount={maxCount}
        onChange={onChange}
        fileList={files}
        type="button"
        bnt={{ label: "Upload files" }}
      />
      {totalFiles > 0 && (
        <>
          <StatsContainer>
            <Stats>
              <StatItem>
                <CheckCircledIcon
                  width={16}
                  height={16}
                  style={{ color: "#10b981" }}
                />
                {successFiles} file{successFiles !== 1 ? "s" : ""} uploaded
              </StatItem>
              {errorFiles > 0 && (
                <StatItem error>
                  <CrossCircledIcon width={16} height={16} />
                  {errorFiles} file{errorFiles !== 1 ? "s" : ""} with errors
                </StatItem>
              )}
            </Stats>
            <ControlButtons>
              {errorFiles > 0 && (
                <Button onClick={clearErrorFiles}>Clear error files</Button>
              )}
              <Button variant="danger" onClick={clearAllFiles}>
                <TrashIcon width={14} height={14} />
                Clear all
              </Button>
            </ControlButtons>
          </StatsContainer>

          <FilesList>
            {files.map((file) => (
              <FileItem key={file.id} isError={file.isError}>
                {getFilePreview(file)}

                <FileInfo>
                  <div className="file-name">{file.file.name}</div>
                  <div className="file-size">
                    {formatFileSize(file.file.size)}
                  </div>
                  {file.isError && (
                    <div className="error-message">{file.errorMessage}</div>
                  )}
                </FileInfo>

                {!file.isError ? (
                  <CheckCircledIcon
                    width={16}
                    height={16}
                    style={{ color: "#10b981" }}
                  />
                ) : (
                  <CrossCircledIcon
                    width={16}
                    height={16}
                    style={{ color: "#ef4444" }}
                  />
                )}

                <ActionButton onClick={() => handleRemoveFile(file.id)}>
                  <TrashIcon width={16} height={16} color="#ef4444" />
                </ActionButton>
              </FileItem>
            ))}
          </FilesList>
        </>
      )}
    </UploadContainer>
  );
};

export default UploadFiles;
