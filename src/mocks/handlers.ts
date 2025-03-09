// mocks/handlers.js
import { http, HttpResponse } from 'msw';

interface User {
  id: number;
  name: string;
}

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
];