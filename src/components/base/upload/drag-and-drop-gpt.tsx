import React, { useState, useRef } from "react";
import styled from "@emotion/styled";
import { CheckIcon, Cross2Icon, ExclamationTriangleIcon } from "@radix-ui/react-icons";

const Container = styled.div`
  border: 2px dashed #ccc;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  border-radius: 8px;
  transition: border 0.3s;
  &:hover {
    border-color: #888;
  }
`;

const FileList = styled.div`
  margin-top: 10px;
  max-height: 200px;
  overflow-y: auto;
`;

const FileItem = styled.div`
  display: flex;
  align-items: center;
  padding: 8px;
  border-bottom: 1px solid #eee;
`;

const FileThumbnail = styled.img`
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: 4px;
  margin-right: 10px;
`;

const FileInfo = styled.div`
  flex-grow: 1;
`;

const FileActions = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
`;

const ProgressBar = styled.div<{ progress: number; status: "uploading" | "success" | "failed" }>`
  height: 5px;
  width: ${(props) => props.progress}%;
  background: ${(props) => (props.status === "failed" ? "red" : "green")};
  transition: width 0.3s ease-in-out;
`;

interface FileUpload {
  file: File;
  progress: number;
  status: "uploading" | "success" | "failed";
}

const FileUploader: React.FC<{ multiple?: boolean; accept?: string }> = ({ multiple = true, accept }) => {
  const [files, setFiles] = useState<FileUpload[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const droppedFiles = Array.from(event.dataTransfer.files);
    handleFiles(droppedFiles);
  };

  const handleFiles = (selectedFiles: File[]) => {
    const newFiles = selectedFiles.map((file) => ({
      file,
      progress: 0,
      status: "uploading" as const,
    }));
    setFiles((prev) => [...prev, ...newFiles]);
    fakeUpload(newFiles);
  };

  const fakeUpload = (uploads: FileUpload[]) => {
    uploads.forEach((upload) => {
      const interval = setInterval(() => {
        setFiles((prev) => {
          const updatedFiles = [...prev];
          const fileIndex = prev.findIndex((f) => f.file === upload.file);
          if (fileIndex !== -1) {
            if (updatedFiles[fileIndex].progress >= 100) {
              updatedFiles[fileIndex].status = Math.random() > 0.1 ? "success" : "failed";
              clearInterval(interval);
            } else {
              updatedFiles[fileIndex].progress += 10;
            }
          }
          return updatedFiles;
        });
      }, 500);
    });
  };

  const removeFile = (fileToRemove: File) => {
    setFiles((prev) => prev.filter((f) => f.file !== fileToRemove));
  };

  return (
    <div>
      <Container onDragOver={(e) => e.preventDefault()} onDrop={onDrop} onClick={() => fileInputRef.current?.click()}>
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept={accept}
          style={{ display: "none" }}
          onChange={(e) => handleFiles(Array.from(e.target.files || []))}
        />
        <p>Kéo và thả tệp vào đây hoặc bấm để chọn</p>
      </Container>
      <FileList>
        {files.map(({ file, progress, status }) => (
          <FileItem key={file.name}>
            {file.type.startsWith("image/") && <FileThumbnail src={URL.createObjectURL(file)} alt={file.name} />}
            <FileInfo>
              <div>{file.name} ({(file.size / 1024).toFixed(2)} KB)</div>
              {status === "uploading" && <ProgressBar progress={progress} status={status} />}
              {status === "uploading" && <div>{progress}%</div>}
            </FileInfo>
            <FileActions>
              {status === "success" && <><CheckIcon color="green" /><span>Uploaded</span></>}
              {status === "failed" && <><ExclamationTriangleIcon color="red" /><span style={{ color: "red" }}>Upload Failed</span></>}
              <Cross2Icon color="gray" onClick={() => removeFile(file)} style={{ cursor: "pointer" }} />
            </FileActions>
          </FileItem>
        ))}
      </FileList>
    </div>
  );
};

export default FileUploader;
