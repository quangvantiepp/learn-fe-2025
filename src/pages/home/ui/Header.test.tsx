// src/__tests__/App.test.jsx
import { screen, waitFor } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Header } from "./header";
import { renderWithClient } from "../../../utils/test-utils";

describe("App", () => {
  it("show list of users from API", async () => {
    renderWithClient(<Header />);

    // Waiting for data from emulator API to be displayed
    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    });
  });
});
