import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import Button from "./Button";

test("renders button with label and handles click", () => {
  const handleClick = vi.fn();
  render(<Button label="Click me" onClick={handleClick} />);

  const button = screen.getByText("Click me");
  expect(button).toBeInTheDocument();

  fireEvent.click(button);
  expect(handleClick).toHaveBeenCalledTimes(1);
});
