import { ToolUIPart } from "ai";
import {
  AlertCircleIcon,
  CircleSlash,
  FileText,
  GlobeIcon,
  Lightbulb,
  LucideIcon,
  SearchIcon,
} from "lucide-react";
import { ToolNameEnum, ToolNameType } from "@/lib/ai/tools/constant";

export const getToolStatus = (
  toolName: ToolNameType,
  state: ToolUIPart["state"],
  output?: any
): { text: string; icon: LucideIcon } => {
  const notes = Array.isArray(output?.notes) ? output.notes : [];
  const length = notes?.length;

  if (state === "input-streaming") {
    return { text: "Preparing request...", icon: Lightbulb };
  }

  if (state === "input-available") {
    return toolName === ToolNameEnum.CreateNote
      ? { text: "Creating note..", icon: FileText }
      : toolName === ToolNameEnum.SearchNote
      ? { text: "Searching note..", icon: SearchIcon }
      : toolName === ToolNameEnum.WebSearch
      ? { text: "Searching web..", icon: GlobeIcon }
      : toolName === ToolNameEnum.ExtractWebUrl
      ? { text: "Extracting content..", icon: GlobeIcon }
      : { text: "Working...", icon: Lightbulb };
  }

  if (state === "output-available") {
    return toolName === ToolNameEnum.CreateNote
      ? { text: `Result from ${toolName}`, icon: Lightbulb }
      : toolName === ToolNameEnum.SearchNote
      ? {
          text: length > 0 ? `${length} notes found` : "Searched note results",
          icon: SearchIcon,
        }
      : toolName === ToolNameEnum.WebSearch
      ? { text: "Web search results", icon: GlobeIcon }
      : toolName === ToolNameEnum.ExtractWebUrl
      ? { text: "Extracted content", icon: GlobeIcon }
      : { text: "Done", icon: Lightbulb };
  }

  if (state === "output-error") {
    return { text: "Error occurred", icon: AlertCircleIcon };
  }

  return { text: "Unknown", icon: CircleSlash };
};
