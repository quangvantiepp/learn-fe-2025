// src/store/slices/folderSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface FolderState {
  openFolders: string[];
  selectedItems: string[];
  currentPage: number;
  itemsPerPage: number;
}

const initialState: FolderState = {
  openFolders: [],
  selectedItems: [],
  currentPage: 1,
  itemsPerPage: 20,
};

export const folderSlice = createSlice({
  name: 'folder',
  initialState,
  reducers: {
    toggleFolder: (state, action: PayloadAction<string>) => {
      const folderId = action.payload;
      if (state.openFolders.includes(folderId)) {
        state.openFolders = state.openFolders.filter(id => id !== folderId);
      } else {
        state.openFolders.push(folderId);
      }
    },
    toggleSelectItem: (state, action: PayloadAction<string>) => {
      const itemId = action.payload;
      if (state.selectedItems.includes(itemId)) {
        state.selectedItems = state.selectedItems.filter(id => id !== itemId);
      } else {
        state.selectedItems.push(itemId);
      }
    },
    selectAllInFolder: (state, action: PayloadAction<string[]>) => {
      const fileIds = action.payload;
      const newSelectedItems = [...state.selectedItems];
      
      fileIds.forEach(id => {
        if (!newSelectedItems.includes(id)) {
          newSelectedItems.push(id);
        }
      });
      
      state.selectedItems = newSelectedItems;
    },
    unselectAllInFolder: (state, action: PayloadAction<string[]>) => {
      const fileIds = action.payload;
      state.selectedItems = state.selectedItems.filter(
        id => !fileIds.includes(id)
      );
    },
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    setPaginationConfig: (state, action: PayloadAction<{ itemsPerPage: number }>) => {
      state.itemsPerPage = action.payload.itemsPerPage;
    },
  },
});

export const {
  toggleFolder,
  toggleSelectItem,
  selectAllInFolder,
  unselectAllInFolder,
  setCurrentPage,
  setPaginationConfig,
} = folderSlice.actions;

export default folderSlice.reducer;