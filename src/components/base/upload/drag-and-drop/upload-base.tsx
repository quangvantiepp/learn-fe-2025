import styled from "@emotion/styled";
import { UploadIcon } from "@radix-ui/react-icons";
import React, { useCallback, useRef, useState } from "react";
import Button from "../../../ui/button/Button";

// Types
export interface FileItem {
  id: string;
  file: File;
  preview?: string;
  isError?: boolean;
  errorMessage?: string;
}

export interface UploadProps {
  type?: "button" | "drag-and-drop";
  bnt?: {
    label?: string;
  };
  maxCount?: number;
  multiple?: boolean;
  accept?: string;
  maxSize?: number; // in bytes
  fileList: FileItem[];
  onChange: (totalSelectFiles: FileItem[], selectedFiles: FileItem[]) => void;
}

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

const FileItem = styled.div<{ hasError?: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  border-radius: 6px;
  background-color: ${(props) => (props.hasError ? "#FEF2F2" : "#f9fafb")};
  border: 1px solid ${(props) => (props.hasError ? "#FEE2E2" : "#f3f4f6")};
`;

const HiddenInput = styled.input`
  display: none;
`;

// Utility Functions
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";

  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${parseFloat((bytes / Math.pow(1024, i)).toFixed(2))} ${sizes[i]}`;
};

const isValidType = (file: File, accept?: string) => {
  if (accept) {
    const acceptedTypes = accept.split(",").map((type) => type.trim());
    const isValid = acceptedTypes.some((type) => {
      if (type === "*") return true; // Chấp nhận mọi loại file
      if (type.startsWith(".")) {
        return file.name.toLowerCase().endsWith(type.toLowerCase()); // Kiểm tra phần mở rộng
      }
      if (type.endsWith("/*")) {
        return file.type.startsWith(type.replace("/*", "")); // Kiểm tra MIME group (image/*, video/*, ...)
      }
      return file.type === type; // Kiểm tra MIME type chính xác
    });

    return isValid;
  }
  return true;
};

// Check if file is a duplicate
const isFileDuplicate = (file: File, existingFiles: FileItem[]): boolean => {
  return existingFiles.some(
    (existingFile) =>
      existingFile.file.name === file.name &&
      existingFile.file.size === file.size
  );
};

// Hàm sắp xếp file - dùng trong component Upload
const sortFiles = (files: FileItem[]): FileItem[] => {
  // Sắp xếp file lỗi lên đầu
  return [...files].sort((a, b) => {
    // Nếu a có lỗi và b không có lỗi, a sẽ lên trước
    if (a.isError && !b.isError) return -1;
    // Nếu b có lỗi và a không có lỗi, b sẽ lên trước
    if (!a.isError && b.isError) return 1;
    // Nếu cả hai đều có lỗi hoặc cả hai đều không có lỗi, sắp xếp theo thời gian thêm vào (mới nhất lên đầu)
    return (
      new Date(b.id.split("-")[1]).getTime() -
      new Date(a.id.split("-")[1]).getTime()
    );
  });
};

const validateFile = (
  file: File,
  fileList: FileItem[],
  accept?: string,
  maxSize?: number
): FileItem => {
  let isError = false;
  let errorMessage = "";

  if (!isValidType(file, accept)) {
    isError = true;
    errorMessage = "Invalid file type.";
  } else if (file.size === 0) {
    isError = true;
    errorMessage = "Empty file.";
  } else if (maxSize && file.size > maxSize) {
    isError = true;
    errorMessage = `Exceeds maximum size limit of ${formatFileSize(maxSize)}`;
  } else if (isFileDuplicate(file, fileList)) {
    isError = true;
    errorMessage = "Duplicate file.";
  }

  return {
    id: crypto.randomUUID(),
    file,
    preview: file.type.startsWith("image/")
      ? URL.createObjectURL(file)
      : undefined,
    isError,
    errorMessage,
  };
};

// Main Component
const Upload: React.FC<UploadProps> = ({
  type = "drag-and-drop",
  bnt = {
    label: "Upload files",
  },
  multiple = false,
  accept,
  maxSize,
  maxCount,
  fileList,
  onChange,
}) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef<number>(0);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    dragCounter.current += 1;
    setIsDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    dragCounter.current -= 1;
    if (dragCounter.current === 0) {
      setIsDragActive(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const processFiles = useCallback(
    (selectedFiles: FileList) => {
      if (maxCount && fileList.length + selectedFiles.length > maxCount) {
        alert(`You can only upload ${maxCount} files at a time. `);
        return;
      }
      const newFileItems = Array.from(selectedFiles).map((file) =>
        validateFile(file, fileList, accept, maxSize)
      );
      console.log("newFileItems:", newFileItems);
      onChange(sortFiles([...fileList, ...newFileItems]), newFileItems);
    },
    [maxSize, maxCount, accept, fileList, onChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      dragCounter.current = 0;
      setIsDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        if (!multiple && e.dataTransfer.files.length > 1) {
          alert("You can only upload one file at a time.");
          return;
        }
        processFiles(e.dataTransfer.files);
      }
    },
    [processFiles, multiple]
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
  console.log("bnt:", bnt);
  return (
    <>
      {type === "button" ? (
        <Button onClick={openFileDialog} label={bnt.label} />
      ) : (
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
            {maxCount && <p>Maximum files: {maxCount}</p>}
          </UploadText>
        </DropZone>
      )}
      <HiddenInput
        ref={inputRef}
        type="file"
        multiple={multiple}
        accept={accept}
        onChange={handleFileInputChange}
      />
    </>
  );
};

export default Upload;
