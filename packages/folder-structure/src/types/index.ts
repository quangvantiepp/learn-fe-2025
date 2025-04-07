// src/types/index.ts
export interface BaseItem {
    id: string;
    name: string;
    type: 'file' | 'folder';
  }
  
  export interface FileItem extends BaseItem {
    type: 'file';
    isLabeled: boolean;
  }
  
  export interface FolderType extends BaseItem {
    type: 'folder';
    hasChildren: boolean;
  }
  
  export type FolderItemType = FileItem | FolderType;
  
  export interface FolderContentsResponse {
    items: FolderItemType[];
    totalItems: number;
    totalPages: number;
    currentPage: number;
  }