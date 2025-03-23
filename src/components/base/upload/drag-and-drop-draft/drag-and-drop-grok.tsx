// FileUpload.tsx
import React, { useRef, useState } from "react";
import styled from "@emotion/styled";
import * as RadixIcons from "@radix-ui/react-icons";

interface UploadedFile {
  id: string;
  file: File;
  preview?: string;
  progress: number;
  status: "uploading" | "success" | "failed";
}

interface FileUploadProps {
  accept?: string[];
  multiple?: boolean;
  onFilesUploaded?: (files: File[]) => void;
}

const UploadContainer = styled.div`
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
`;

const DropZone = styled.div<{ isDragActive: boolean }>`
  border: 2px dashed
    ${({ isDragActive }) => (isDragActive ? "#4f46e5" : "#d1d5db")};
  border-radius: 8px;
  padding: 40px;
  text-align: center;
  background-color: ${({ isDragActive }) =>
    isDragActive ? "#f9fafb" : "#ffffff"};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: #4f46e5;
    background-color: #f9fafb;
  }
`;

const HiddenInput = styled.input`
  display: none;
`;

const FileList = styled.div`
  max-height: 300px;
  overflow-y: auto;
  margin-top: 20px;
`;

const FileItem = styled.div`
  display: flex;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid #e5e7eb;
`;

const FilePreview = styled.img`
  width: 40px;
  height: 40px;
  object-fit: cover;
  margin-right: 10px;
  border-radius: 4px;
`;

const FileInfo = styled.div`
  flex: 1;
  margin-right: 10px;
`;

const ProgressBar = styled.div<{ progress: number }>`
  width: 100px;
  height: 4px;
  background-color: #e5e7eb;
  border-radius: 2px;
  overflow: hidden;

  &::after {
    content: "";
    display: block;
    width: ${({ progress }) => progress}%;
    height: 100%;
    background-color: #4f46e5;
    transition: width 0.3s ease;
  }
`;

const DeleteButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: #ef4444;
  padding: 4px;
`;

const FileUpload: React.FC<FileUploadProps> = ({
  accept = ["*/*"],
  multiple = true,
  onFilesUploaded,
}) => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragActive, setIsDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} KB`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} GB`;
  };

  const simulateUpload = (file: UploadedFile) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setUploadedFiles((prev) =>
        prev.map((f) => (f.id === file.id ? { ...f, progress } : f))
      );
      if (progress >= 100) {
        clearInterval(interval);
        setUploadedFiles((prev) =>
          prev.map((f) => (f.id === file.id ? { ...f, status: "success" } : f))
        );
      }
    }, 200);
  };

  const handleFiles = (files: FileList) => {
    const fileArray = Array.from(files);
    const filteredFiles = accept.includes("*/*")
      ? fileArray
      : fileArray.filter((file) =>
          accept.some((type) => file.type.startsWith(type.split("/")[0]))
        );

    const newFiles: UploadedFile[] = filteredFiles.map((file) => {
      const newFile = {
        id: Math.random().toString(36).substring(2),
        file,
        progress: 0,
        status: "uploading" as const,
        preview: file.type.startsWith("image/")
          ? URL.createObjectURL(file)
          : undefined,
      };
      simulateUpload(newFile);
      return newFile;
    });

    setUploadedFiles((prev) => [...prev, ...newFiles]);
    if (onFilesUploaded) {
      onFilesUploaded(filteredFiles);
    }
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFiles(files);
    }
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFiles(files);
    }
  };

  const handleDelete = (id: string) => {
    setUploadedFiles((prev) => prev.filter((file) => file.id !== id));
  };

  return (
    <UploadContainer>
      <DropZone
        isDragActive={isDragActive}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <HiddenInput
          ref={inputRef}
          type="file"
          multiple={multiple}
          accept={accept.join(",")}
          onChange={handleInputChange}
        />
        <RadixIcons.UploadIcon width={24} height={24} />
        <p>
          {isDragActive
            ? "Thả file vào đây..."
            : "Kéo thả file vào đây hoặc nhấp để chọn file"}
        </p>
      </DropZone>

      {uploadedFiles.length > 0 && (
        <FileList>
          {uploadedFiles.map((file) => (
            <FileItem key={file.id}>
              {file.preview && (
                <FilePreview src={file.preview} alt={file.file.name} />
              )}
              <FileInfo>
                <div>{file.file.name}</div>
                <div>{formatFileSize(file.file.size)}</div>
                {file.status === "uploading" && (
                  <ProgressBar progress={file.progress} />
                )}
              </FileInfo>
              {file.status === "success" && (
                <RadixIcons.CheckCircledIcon color="#22c55e" />
              )}
              {file.status === "failed" && (
                <RadixIcons.CrossCircledIcon color="#ef4444" />
              )}
              <DeleteButton onClick={() => handleDelete(file.id)}>
                <RadixIcons.TrashIcon />
              </DeleteButton>
            </FileItem>
          ))}
        </FileList>
      )}
    </UploadContainer>
  );
};

export default FileUpload;
