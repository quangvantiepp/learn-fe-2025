// import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./utils/use-query-client.ts";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

// config msw mock api
if (import.meta.env.MODE === "development") {
  const { worker } = await import("./mocks/browser.ts");
  await worker.start();
}

createRoot(document.getElementById("root")!).render(
  // <StrictMode>
  <QueryClientProvider client={queryClient}>
    <App />
    <ReactQueryDevtools initialIsOpen={false} />
  </QueryClientProvider>
  // </StrictMode>
);
