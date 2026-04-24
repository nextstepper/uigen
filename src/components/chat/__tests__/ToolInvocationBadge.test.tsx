import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolInvocationBadge, getToolLabel } from "../ToolInvocationBadge";

afterEach(() => {
  cleanup();
});

// --- getToolLabel unit tests ---

test("getToolLabel: str_replace_editor create", () => {
  expect(getToolLabel({ toolName: "str_replace_editor", state: "call", args: { command: "create", path: "src/components/Button.tsx" } })).toBe("Creating Button.tsx");
});

test("getToolLabel: str_replace_editor str_replace", () => {
  expect(getToolLabel({ toolName: "str_replace_editor", state: "call", args: { command: "str_replace", path: "src/App.tsx" } })).toBe("Editing App.tsx");
});

test("getToolLabel: str_replace_editor insert", () => {
  expect(getToolLabel({ toolName: "str_replace_editor", state: "call", args: { command: "insert", path: "src/index.ts" } })).toBe("Editing index.ts");
});

test("getToolLabel: str_replace_editor view", () => {
  expect(getToolLabel({ toolName: "str_replace_editor", state: "call", args: { command: "view", path: "src/utils.ts" } })).toBe("Reading utils.ts");
});

test("getToolLabel: str_replace_editor unknown command falls back to Editing", () => {
  expect(getToolLabel({ toolName: "str_replace_editor", state: "call", args: { command: "undo_edit", path: "src/foo.ts" } })).toBe("Editing foo.ts");
});

test("getToolLabel: file_manager rename", () => {
  expect(getToolLabel({ toolName: "file_manager", state: "call", args: { command: "rename", path: "src/Old.tsx", new_path: "src/New.tsx" } })).toBe("Renaming Old.tsx → New.tsx");
});

test("getToolLabel: file_manager delete", () => {
  expect(getToolLabel({ toolName: "file_manager", state: "call", args: { command: "delete", path: "src/Dead.tsx" } })).toBe("Deleting Dead.tsx");
});

test("getToolLabel: unknown tool returns toolName", () => {
  expect(getToolLabel({ toolName: "some_other_tool", state: "call", args: {} })).toBe("some_other_tool");
});

// --- ToolInvocationBadge rendering tests ---

test("shows label and spinner when in-progress", () => {
  render(
    <ToolInvocationBadge
      tool={{ toolName: "str_replace_editor", state: "call", args: { command: "create", path: "src/Card.tsx" } }}
    />
  );
  expect(screen.getByText("Creating Card.tsx")).toBeDefined();
  // spinner element is present (has animate-spin class)
  const spinner = document.querySelector(".animate-spin");
  expect(spinner).not.toBeNull();
});

test("shows label and green dot when done", () => {
  render(
    <ToolInvocationBadge
      tool={{ toolName: "str_replace_editor", state: "result", args: { command: "str_replace", path: "src/App.tsx" }, result: "ok" }}
    />
  );
  expect(screen.getByText("Editing App.tsx")).toBeDefined();
  // no spinner
  expect(document.querySelector(".animate-spin")).toBeNull();
  // green dot present
  expect(document.querySelector(".bg-emerald-500")).not.toBeNull();
});

test("does not show green dot when result is null", () => {
  render(
    <ToolInvocationBadge
      tool={{ toolName: "str_replace_editor", state: "result", args: { command: "create", path: "src/X.tsx" }, result: null }}
    />
  );
  expect(document.querySelector(".bg-emerald-500")).toBeNull();
  expect(document.querySelector(".animate-spin")).not.toBeNull();
});
