// src/mocks/data/folders.ts
import { FolderType, FileItem, FolderItemType } from '../../types';

// Tạo dữ liệu mẫu với nhiều cấp thư mục
const generateFiles = (folderId: string, count: number): FileItem[] => {
  return Array.from({ length: count }).map((_, index) => ({
    id: `${folderId}-file-${index}`,
    name: `File ${index}`,
    type: 'file' as const,
    isLabeled: Math.random() > 0.5, // 50% chance to be labeled
  }));
};

const generateFolders = (parentId: string, count: number): FolderType[] => {
  return Array.from({ length: count }).map((_, index) => ({
    id: `${parentId}-folder-${index}`,
    name: `Folder ${index}`,
    type: 'folder' as const,
    hasChildren: true,
  }));
};

// Tạo cấu trúc dữ liệu folder
export const folderData = [
  {
    id: 'root',
    name: 'Root',
    type: 'folder' as const,
    hasChildren: true,
    children: [
      ...generateFiles('root', 5),
      ...generateFolders('root', 3)
    ]
  },
  {
    id: 'root-folder-0',
    name: 'Folder 0',
    type: 'folder' as const,
    hasChildren: true,
    children: [
      ...generateFiles('root-folder-0', 10),
      ...generateFolders('root-folder-0', 2)
    ]
  },
  {
    id: 'root-folder-1',
    name: 'Folder 1',
    type: 'folder' as const,
    hasChildren: true,
    children: [
      ...generateFiles('root-folder-1', 7),
    ]
  },
  {
    id: 'root-folder-2',
    name: 'Folder 2',
    type: 'folder' as const,
    hasChildren: true,
    children: [
      ...generateFiles('root-folder-2', 3),
      ...generateFolders('root-folder-2', 4)
    ]
  },
  {
    id: 'root-folder-0-folder-0',
    name: 'Subfolder 0-0',
    type: 'folder' as const,
    hasChildren: true,
    children: [
      ...generateFiles('root-folder-0-folder-0', 8),
    ]
  },
  {
    id: 'root-folder-0-folder-1',
    name: 'Subfolder 0-1',
    type: 'folder' as const,
    hasChildren: true,
    children: [
      ...generateFiles('root-folder-0-folder-1', 6),
    ]
  },
];