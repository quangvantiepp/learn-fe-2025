// src/components/FolderStructure/File.tsx
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import styled from "@emotion/styled";
import { toggleSelectItem } from "../../store/slices/folder-slice";
import { RootState } from "../../store";
import { FileItem as FileItemType } from "../../types";

const FileContainer = styled.div<{ isSelected: boolean; isLabeled: boolean }>`
  display: flex;
  align-items: center;
  padding: 8px;
  background-color: ${(props) =>
    props.isSelected ? "#e6f7ff" : "transparent"};
  border-left: 3px solid ${(props) => (props.isLabeled ? "green" : "red")};
`;

const Checkbox = styled.input`
  margin-right: 8px;
`;

const FileName = styled.span`
  margin-left: 8px;
`;

interface FileProps {
  file: FileItemType;
  level: number;
}

export const File: React.FC<FileProps> = ({ file, level }) => {
  const dispatch = useDispatch();
  const selectedItems = useSelector(
    (state: RootState) => state.folder.selectedItems
  );
  const isSelected = selectedItems.includes(file.id);

  const handleSelect = () => {
    dispatch(toggleSelectItem(file.id));
  };

  return (
    <FileContainer
      isSelected={isSelected}
      isLabeled={file.isLabeled}
      style={{ marginLeft: `${level * 20}px` }}
    >
      <Checkbox type="checkbox" checked={isSelected} onChange={handleSelect} />
      <FileName>{file.name}</FileName>
    </FileContainer>
  );
};
