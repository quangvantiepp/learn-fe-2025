// src/services/api.ts
import { FolderItem, FolderContentsResponse } from '../types';

export async function fetchFolderContents(
  folderId: string,
  page: number,
  perPage: number
): Promise<FolderContentsResponse> {
  const response = await fetch(`/api/folders/${folderId}/contents?page=${page}&perPage=${perPage}`);
  if (!response.ok) {
    throw new Error('Failed to fetch folder contents');
  }
  return response.json();
}