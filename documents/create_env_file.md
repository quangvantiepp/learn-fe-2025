### Prefix bắt buộc: Tất cả biến muốn sử dụng trong code phải bắt đầu bằng VITE_
Các file môi trường:
```sh
.env: Chung cho mọi môi trường
.env.development: Cho môi trường phát triển
.env.production: Cho môi trường sản xuất
.env.local: Cục bộ, không commit vào git

```

Sử dụng trong code: Truy cập thông qua import.meta.env.VITE_TEN_BIEN
TypeScript support: Tạo file env.d.ts để có IntelliSense cho các biến môi trường
Bảo mật: Không lưu thông tin nhạy cảm trong biến có prefix VITE_ vì chúng sẽ được bundle và có thể bị lộ


### step by step
#### 1 create .env file  or .env.development
# API URLs
VITE_API_URL=https://api.example.com
VITE_API_KEY=your_api_key_here

# App settings
VITE_APP_NAME=My React App
VITE_APP_VERSION=1.0.0

#### 2 mở rộng interface
```ts
// in vite-env.d.ts in src
/// <reference types="vite/client" />
interface ImportMetaEnv {
    readonly VITE_API_URL: string;
    readonly VITE_APP_TITLE: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
```

#### 3 Thiết lập các script trong package.json

```sh
{
  "scripts": {
    "dev": "vite",
    "dev:staging": "vite --mode staging",
    "dev:test": "vite --mode test",
    "build": "tsc && vite build",
    "build:staging": "tsc && vite build --mode staging",
    "build:test": "tsc && vite build --mode test",
    "preview": "vite preview",
    "preview:staging": "vite preview --mode staging"
  }
}

Dựa vào mode bạn chỉ định, Vite sẽ tự động tìm và nạp file .env phù hợp:

.env - Tải trong tất cả các trường hợp
.env.local - Tải trong tất cả các trường hợp, bị git ignore
.env.[mode] - Chỉ tải trong mode cụ thể
.env.[mode].local - Chỉ tải trong mode cụ thể, bị git ignore

Ví dụ, nếu bạn muốn có các môi trường development, staging, test và production:

.env (dùng cho tất cả môi trường)
.env.development (môi trường mặc định khi chạy pnpm dev)
.env.staging (cho môi trường staging)
.env.test (cho môi trường test)
.env.production (môi trường mặc định khi chạy pnpm build)
```
#### 4 use it
```tsx
const apiUrl = import.meta.env.VITE_API_URL;
const appVersion = import.meta.env.VITE_APP_VERSION;

// check mode
console.log(`Current mode: ${import.meta.env.MODE}`);

if (import.meta.env.MODE === 'staging') {
  // Logic cho môi trường staging
}
```
#### 5 run project
```sh
# Chạy với mode mặc định (development)
pnpm dev

# Chạy với mode staging
pnpm dev:staging

# Chạy với mode test
pnpm dev:test

# Build với mode mặc định (production)
pnpm build

# Build với mode staging
pnpm build:staging
```