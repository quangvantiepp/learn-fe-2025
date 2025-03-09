## install MSW
pnpm add -D msw vitest @testing-library/react jsdom

msw: Thư viện Mock Service Worker để mô phỏng API.
vitest: Framework kiểm thử nhanh và tương thích với Vite.
@testing-library/react: Thư viện để kiểm thử React components.
jsdom: Môi trường DOM giả lập cho Node.js.

### Khởi tạo MSW
MSW yêu cầu một tệp mockServiceWorker.js để hoạt động trong trình duyệt. Chạy lệnh sau để tạo tệp này: Lệnh này sẽ tạo tệp public/mockServiceWorker.js.
pnpm msw init public/ --save

### Thiết lập MSW Handlers
Tạo một thư mục mocks/ trong thư mục gốc của dự án để quản lý các handler của MSW.

#### 1, Tạo tệp mocks/handlers.js để định nghĩa các API giả lập:
```javascript
// mocks/handlers.js
import { http, HttpResponse } from 'msw';

export const handlers = [
  // Ví dụ: Mô phỏng một API GET
  http.get('/api/users', () => {
    return HttpResponse.json([
      { id: 1, name: 'John Doe' },
      { id: 2, name: 'Jane Doe' },
    ]);
  }),

  // Ví dụ: Mô phỏng một API POST
  http.post('/api/users', async ({ request }) => {
    const newUser = await request.json();
    return HttpResponse.json({ id: 3, ...newUser }, { status: 201 });
  }),
];
```

#### 2, Tạo tệp mocks/server.js để thiết lập server MSW cho môi trường Node.js (dùng khi kiểm thử):
```javascript
// mocks/server.js
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
```

#### (Tùy chọn) Tạo tệp mocks/browser.js nếu bạn muốn dùng MSW trong quá trình phát triển (trình duyệt):
```javascript
// mocks/browser.js
import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

export const worker = setupWorker(...handlers);
```
### Cau hinh vitest
```javascript
// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom', // Dùng jsdom để mô phỏng DOM
    setupFiles: './tests/setup.js', // Tệp thiết lập cho kiểm thử
    globals: true, // Cho phép dùng các API như `describe`, `it` mà không cần import
  },
});
```

#### Tạo tệp tests/setup.js để khởi động và quản lý MSW server trong quá trình kiểm thử:
```javascript
// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom', // Dùng jsdom để mô phỏng DOM
    setupFiles: './tests/setup.js', // Tệp thiết lập cho kiểm thử
    globals: true, // Cho phép dùng các API như `describe`, `it` mà không cần import
  },
});
```
#### Tạo tệp tests/setup.js để khởi động và quản lý MSW server trong quá trình kiểm thử:
```javascript
// tests/setup.js
import { beforeAll, afterAll, afterEach } from 'vitest';
import { server } from '../mocks/server';

// Khởi động server trước khi chạy tất cả các test
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

// Reset handlers sau mỗi test để tránh ảnh hưởng lẫn nhau
afterEach(() => server.resetHandlers());

// Đóng server sau khi tất cả test hoàn tất
afterAll(() => server.close());
```

### Viết test với MSW
```javascript
//Tạo một tệp test, ví dụ src/__tests__/App.test.jsx, để kiểm tra component React gọi API
// src/__tests__/App.test.jsx
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from '../App';

describe('App', () => {
  it('hiển thị danh sách users từ API', async () => {
    render(<App />);
    
    // Chờ dữ liệu từ API giả lập được hiển thị
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    });
  });
});
```

Giả sử component App.jsx của bạn trông như sau:
```javascript
// src/App.jsx
import { useEffect, useState } from 'react';

function App() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetch('/api/users')
      .then((res) => res.json())
      .then((data) => setUsers(data));
  }, []);

  return (
    <div>
      {users.map((user) => (
        <p key={user.id}>{user.name}</p>
      ))}
    </div>
  );
}
export default App;
```

### some cases for test mock api
 #### 1. Test API gọi đúng và hiển thị dữ liệu

```javascript
//Kiểm tra xem API có được gọi và dữ liệu hiển thị đúng không.

it("displays the list of users when the API call is successful", async () => {
  renderWithClient(<Header />);

  expect(await screen.findByText("John Doe")).toBeInTheDocument();
  expect(await screen.findByText("Jane Doe")).toBeInTheDocument();
});
//✅ Đảm bảo API mock trả về dữ liệu và component hiển thị đúng.
```
#### 2. Test API lỗi (Server Error, Network Error)
```javascript
// Kiểm tra khi API bị lỗi thì UI có hiển thị thông báo lỗi không.

it("displays an error message when the API call fails", async () => {
  server.use(
    rest.get("/api/users", (req, res, ctx) => {
      return res(ctx.status(500)); // Simulate server error
    })
  );

  renderWithClient(<Header />);

  expect(await screen.findByText("Failed to load data")).toBeInTheDocument();
});
//✅ UI phải hiển thị lỗi khi API không thành công.
```
#### Test loading state
```javascript
// Kiểm tra có hiển thị "Loading..." khi API đang fetch dữ liệu không.
it("displays a loading message while fetching data", async () => {
  renderWithClient(<Header />);

  expect(screen.getByText("Loading...")).toBeInTheDocument();

  await screen.findByText("John Doe");
  expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
});
//✅ UI phải hiển thị "Loading..." khi đang tải dữ liệu từ API.
```

#### Test API gọi đúng URL và số lần gọi
```javascript
// 💡 Kiểm tra API có được gọi đúng số lần không.
it("calls the API only once and with the correct endpoint", async () => {
  const queryClient = new QueryClient();
  const fetchSpy = vi.spyOn(global, "fetch");

  renderWithClient(<Header />);

  await screen.findByText("John Doe");

  expect(fetchSpy).toHaveBeenCalledTimes(1);
  expect(fetchSpy).toHaveBeenCalledWith("/api/users");

  fetchSpy.mockRestore();
});
//✅ Đảm bảo API chỉ được gọi một lần và đúng endpoint.
```
#### Test khi API trả về dữ liệu rỗng (Empty State)
```javascript
//💡 Kiểm tra khi API trả về mảng rỗng, UI có hiển thị "No users available" không.
it("displays 'No users available' when the API returns an empty response", async () => {
  server.use(
    rest.get("/api/users", (req, res, ctx) => {
      return res(ctx.json([])); // Trả về mảng rỗng
    })
  );

  renderWithClient(<Header />);

  expect(await screen.findByText("No users available")).toBeInTheDocument();
});
//✅ Đảm bảo UI hiển thị thông báo phù hợp khi không có dữ liệu.
```

#### 🎯 Tóm tắt các test cần viết
Test Case	Mô tả trong it() (Tiếng Anh)
✅ API gọi thành công	"displays the list of users when the API call is successful"
✅ API lỗi	"displays an error message when the API call fails"
✅ Loading state	"displays a loading message while fetching data"
✅ API gọi đúng & đủ số lần	"calls the API only once and with the correct endpoint"
✅ Không có dữ liệu	"displays 'No users available' when the API returns an empty response"

