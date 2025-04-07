// src/store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import folderReducer from './slices/folder-slice';

export const store = configureStore({
  reducer: {
    folder: folderReducer,
  },
});

// Export types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;