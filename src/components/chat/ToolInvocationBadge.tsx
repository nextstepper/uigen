import { Loader2 } from "lucide-react";

interface ToolInvocation {
  toolName: string;
  state: string;
  args: Record<string, unknown>;
  result?: unknown;
}

export function getToolLabel(tool: ToolInvocation): string {
  const path = (tool.args.path as string) ?? "";
  const filename = path.split("/").pop() || path;

  if (tool.toolName === "str_replace_editor") {
    switch (tool.args.command as string) {
      case "create":    return `Creating ${filename}`;
      case "str_replace":
      case "insert":    return `Editing ${filename}`;
      case "view":      return `Reading ${filename}`;
      default:          return `Editing ${filename}`;
    }
  }

  if (tool.toolName === "file_manager") {
    const newPath = (tool.args.new_path as string) ?? "";
    const newFilename = newPath.split("/").pop() || newPath;
    switch (tool.args.command as string) {
      case "rename": return `Renaming ${filename} → ${newFilename}`;
      case "delete": return `Deleting ${filename}`;
      default:       return filename;
    }
  }

  return tool.toolName;
}

interface ToolInvocationBadgeProps {
  tool: ToolInvocation;
}

export function ToolInvocationBadge({ tool }: ToolInvocationBadgeProps) {
  const done = tool.state === "result" && tool.result != null;
  const label = getToolLabel(tool);

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs font-mono border border-neutral-200">
      {done ? (
        <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
      ) : (
        <Loader2 className="w-3 h-3 animate-spin text-blue-600 shrink-0" />
      )}
      <span className="text-neutral-700">{label}</span>
    </div>
  );
}
