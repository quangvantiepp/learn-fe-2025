import React, { useState, useRef, useCallback } from "react";
import styled from "@emotion/styled";
import {
  Cross2Icon,
  CheckIcon,
  CrossCircledIcon,
  UploadIcon,
} from "@radix-ui/react-icons";

// Types
export interface FileItem {
  id: string;
  file: File;
  preview?: string;
  progress: number;
  status: "idle" | "uploading" | "success" | "error";
}

interface FileUploaderProps {
  multiple?: boolean;
  accept?: string;
  maxSize?: number; // in bytes
  onFileSelect: (files: File[]) => void;
  onFileRemove?: (fileId: string) => void;
  fileItems: FileItem[]; // Controlled array of file items
  updateFileStatus?: (
    fileId: string,
    progress: number,
    status: FileItem["status"]
  ) => void;
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
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";

  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${parseFloat((bytes / Math.pow(1024, i)).toFixed(2))} ${sizes[i]}`;
};

const getFileExtension = (fileName: string): string => {
  return fileName.split(".").pop() || "";
};

// Main Component
const FileUploaderClaudeNew: React.FC<FileUploaderProps> = ({
  multiple = false,
  accept,
  maxSize,
  onFileSelect,
  onFileRemove,
  fileItems,
  //   updateFileStatus
}) => {
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

      Array.from(fileList).forEach((file) => {
        if (maxSize && file.size > maxSize) {
          console.warn(`File ${file.name} exceeds maximum size limit`);
          return;
        }

        newFiles.push(file);
      });

      if (newFiles.length > 0) {
        onFileSelect(newFiles);
      }
    },
    [maxSize, onFileSelect]
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

  const handleRemoveFile = (fileId: string) => {
    if (onFileRemove) {
      onFileRemove(fileId);
    }
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

      {fileItems.length > 0 && (
        <FilesList>
          {fileItems.map((file) => (
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
                  <CheckIcon width={16} height={16} />
                ) : file.status === "error" ? (
                  <CrossCircledIcon width={16} height={16} />
                ) : null}
              </StatusIcon>

              <ActionButton onClick={() => handleRemoveFile(file.id)}>
                <Cross2Icon width={16} height={16} />
              </ActionButton>
            </FileItem>
          ))}
        </FilesList>
      )}
    </UploadContainer>
  );
};

export default FileUploaderClaudeNew;

// Example of how to use with external API control:
/*

import React, { useState, useCallback } from 'react';
import FileUploader, { FileItem } from './FileUploader'; // Đường dẫn đến component của bạn

const MyUploadForm: React.FC = () => {
  // State để lưu trữ các file items
  const [fileItems, setFileItems] = useState<FileItem[]>([]);
  
  // Hàm xử lý khi người dùng chọn file
  const handleFileSelect = useCallback((files: File[]) => {
    // Tạo FileItem objects từ các File được chọn
    const newFileItems: FileItem[] = files.map(file => ({
      id: `${file.name}-${Date.now()}`, // Tạo ID duy nhất
      file,
      progress: 0, // Ban đầu tiến độ là 0
      status: 'idle', // Trạng thái ban đầu
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined // Tạo preview cho file ảnh
    }));
    
    // Thêm vào state
    setFileItems(prev => [...prev, ...newFileItems]);
    
    // Bắt đầu upload từng file
    newFileItems.forEach(fileItem => {
      uploadFile(fileItem);
    });
  }, []);
  
  // Hàm xử lý upload file lên server
  const uploadFile = async (fileItem: FileItem) => {
    try {
      // Cập nhật trạng thái sang 'uploading'
      updateFileStatus(fileItem.id, 0, 'uploading');
      
      // Tạo FormData để gửi lên server
      const formData = new FormData();
      formData.append('file', fileItem.file);
      
      // Khởi tạo XMLHttpRequest để theo dõi tiến trình upload
      const xhr = new XMLHttpRequest();
      
      // Theo dõi tiến trình upload
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          updateFileStatus(fileItem.id, progress, 'uploading');
        }
      };
      
      // Tạo promise để xử lý kết quả
      const uploadPromise = new Promise<void>((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(new Error(`HTTP Error: ${xhr.status}`));
          }
        };
        
        xhr.onerror = () => {
          reject(new Error('Network Error'));
        };
      });
      
      // Gửi request
      xhr.open('POST', 'https://your-api-endpoint.com/upload', true);
      xhr.send(formData);
      
      // Đợi kết quả
      await uploadPromise;
      
      // Nếu thành công, cập nhật trạng thái
      updateFileStatus(fileItem.id, 100, 'success');
      
    } catch (error) {
      console.error(`Lỗi khi upload file ${fileItem.file.name}:`, error);
      
      // Lấy tiến độ hiện tại trước khi đánh dấu lỗi
      const currentItem = fileItems.find(item => item.id === fileItem.id);
      const currentProgress = currentItem ? currentItem.progress : 0;
      
      // Cập nhật trạng thái thành lỗi nhưng giữ nguyên tiến độ đã upload
      updateFileStatus(fileItem.id, currentProgress, 'error');
    }
  };
  
  // Hàm cập nhật trạng thái và tiến độ của file
  const updateFileStatus = (fileId: string, progress: number, status: FileItem['status']) => {
    setFileItems(prev => 
      prev.map(file => 
        file.id === fileId 
          ? { ...file, progress, status } 
          : file
      )
    );
  };
  
  // Hàm xử lý khi xóa file
  const handleFileRemove = useCallback((fileId: string) => {
    setFileItems(prev => {
      const updatedFiles = prev.filter(file => file.id !== fileId);
      const removedFile = prev.find(file => file.id === fileId);
      
      // Giải phóng URL cho preview
      if (removedFile?.preview) {
        URL.revokeObjectURL(removedFile.preview);
      }
      
      // Bạn có thể thêm logic hủy upload đang diễn ra tại đây nếu cần
      
      return updatedFiles;
    });
  }, []);
  
  return (
    <div className="upload-container">
      <h2>Upload Documents</h2>
      <FileUploader 
        multiple={true} // Cho phép upload nhiều file
        accept="image/*,application/pdf" // Chỉ chấp nhận file ảnh và PDF
        maxSize={5 * 1024 * 1024} // Giới hạn 5MB
        onFileSelect={handleFileSelect} // Callback khi có file được chọn
        onFileRemove={handleFileRemove} // Callback khi có file bị xóa
        fileItems={fileItems} // Truyền state fileItems vào component
      />
      
     
      {fileItems.length > 0 && (
        <div className="upload-actions">
          <button onClick={() => console.log('Files:', fileItems)}>
            Xem thông tin files
          </button>
        </div>
      )}
    </div>
  );
};

export default MyUploadForm;
*/
