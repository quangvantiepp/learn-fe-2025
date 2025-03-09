// tests/setup.js // mocks api
import { beforeAll, afterAll, afterEach } from 'vitest';
import { server } from './server';

// Khởi động server trước khi chạy tất cả các test
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

// Reset handlers sau mỗi test để tránh ảnh hưởng lẫn nhau
afterEach(() => server.resetHandlers());

// Đóng server sau khi tất cả test hoàn tất
afterAll(() => server.close());