// src/components/FolderStructure/FolderItem.tsx
import React from "react";
import { File } from "./file";
import { Folder } from "./folder";
import { FolderItemType } from "../../types";

interface FolderItemProps {
  item: FolderItemType;
  level: number;
}

export const FolderItem: React.FC<FolderItemProps> = ({ item, level }) => {
  if (item.type === "folder") {
    return <Folder folder={item} level={level} />;
  } else {
    return <File file={item} level={level} />;
  }
};
