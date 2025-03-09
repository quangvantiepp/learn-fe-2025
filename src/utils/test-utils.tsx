import { QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react";
import { queryClient } from "./use-query-client";

export function renderWithClient(ui: React.ReactElement) {
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  );
}
