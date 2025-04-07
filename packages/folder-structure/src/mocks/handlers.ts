// mocks/handlers.js
import { http, HttpResponse } from 'msw';
// src/mocks/handlers.ts
import { folderData } from './data/folders';

interface User {
  id: number;
  name: string;
}


  // Utility function to introduce delay
  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const handlers = [
  // Ví dụ: Mô phỏng một API GET
  http.get('http://192.168.1.19:8080/api/users', () => {
    return HttpResponse.json([
      { id: 1, name: 'John Doe' },
      { id: 2, name: 'Jane Doe' },
    ]);
  }),
  
  // Ví dụ: Mô phỏng một API POST
  http.post<never, User, User>('/api/users', async ({ request }) => {
    const newUser = await request.json();
  
    return HttpResponse.json({ ...newUser }, { status: 201 });
  }),
  
  http.get('/api/folders/:folderId/contents', async ({ request, params }) => {
    const { folderId } = params;
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page') || '1');
    const perPage = Number(url.searchParams.get('perPage') || '20');
    
    // Add delay
    await sleep(1000); // 1-second delay
  
    // Truy xuất dữ liệu từ mock data
    const folder = folderData.find(f => f.id === folderId);
    if (!folder) {
      return HttpResponse.json({ error: 'Folder not found' }, { status: 404 });
    }
  
    // Tính toán phân trang
    const start = (page - 1) * perPage;
    const end = start + perPage;
    const paginatedItems = folder.children.slice(start, end);
  
    return HttpResponse.json({
      items: paginatedItems,
      totalItems: folder.children.length,
      totalPages: Math.ceil(folder.children.length / perPage),
      currentPage: page,
    });
  })]