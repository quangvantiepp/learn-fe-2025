# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default tseslint.config({
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

- Replace `tseslint.configs.recommended` to `tseslint.configs.recommendedTypeChecked` or `tseslint.configs.strictTypeChecked`
- Optionally add `...tseslint.configs.stylisticTypeChecked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and update the config:

```js
// eslint.config.js
import react from 'eslint-plugin-react'

export default tseslint.config({
  // Set the react version
  settings: { react: { version: '18.3' } },
  plugins: {
    // Add the react plugin
    react,
  },
  rules: {
    // other rules...
    // Enable its recommended rules
    ...react.configs.recommended.rules,
    ...react.configs['jsx-runtime'].rules,
  },
})
```
## design pattern
https://uiverse.io/



## git rebase


## msw mock API


## Vitest react
### Vitest (tích hợp sẵn trong Vite, thay thế Jest)
pnpm add -D vitest @testing-library/react @testing-library/jest-dom
### Cannot find name 'test'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.

### config vite.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test:{
    globals: true,
    environment: "jsdom",
    setupFiles: './src/setupTests.ts'
  }
})
- when have error pnpm add -D jsdom



## run project

### install and run
```sh
pnpm install

pnpm run dev

```

### install for folder structure
```sh
# install react-virtualized
pnpm add react-virtualized
pnpm add -D @types/react-virtualized # Định nghĩa TypeScript

# Cài đặt dependencies chính
pnpm add react react-dom @emotion/react @emotion/styled

# Cài đặt TypeScript và Vite
pnpm add -D typescript vite @vitejs/plugin-react

# Cài đặt các thư viện đề xuất
pnpm add @reduxjs/toolkit react-redux
pnpm add @tanstack/react-query

pnpm add react-loading-skeleton
pnpm add -D msw
```
