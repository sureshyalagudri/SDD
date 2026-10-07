import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ViewSwitcher } from "@/components/ViewSwitcher";

describe("ViewSwitcher", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute("data-view");
  });

  afterEach(cleanup);

  it("defaults to Card with an empty live region", () => {
    render(<ViewSwitcher />);
    expect(screen.getByRole("button", { name: "Card" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "List" })).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByRole("group", { name: "Catalog view" })).toBeInTheDocument();
    expect(document.querySelector("[aria-live]")).toHaveTextContent("");
  });

  it("switches to List, persists, announces, and ignores repeat presses", () => {
    const setItem = vi.spyOn(Storage.prototype, "setItem");
    render(<ViewSwitcher />);

    fireEvent.click(screen.getByRole("button", { name: "List" }));
    expect(document.documentElement.getAttribute("data-view")).toBe("list");
    expect(localStorage.getItem("episodeView")).toBe("list");
    expect(screen.getByRole("button", { name: "List" })).toHaveAttribute("aria-pressed", "true");
    expect(document.querySelector("[aria-live]")).toHaveTextContent("List view selected");
    expect(setItem).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: "List" }));
    expect(setItem).toHaveBeenCalledTimes(1);
    setItem.mockRestore();
  });

  it("reads a preset list attribute on mount", () => {
    document.documentElement.setAttribute("data-view", "list");
    render(<ViewSwitcher />);
    expect(screen.getByRole("button", { name: "List" })).toHaveAttribute("aria-pressed", "true");
  });

  it("falls back to Card for an invalid preset", () => {
    document.documentElement.setAttribute("data-view", "banana");
    render(<ViewSwitcher />);
    expect(screen.getByRole("button", { name: "Card" })).toHaveAttribute("aria-pressed", "true");
  });
});
