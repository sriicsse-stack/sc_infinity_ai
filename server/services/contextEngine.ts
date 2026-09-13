export interface ProjectContextInput {
  activeFile?: string;
  selectedCode?: string;
  openFiles?: string[];
  terminalErrors?: string[];
  userPrompt: string;
}

export class ContextEngine {
  public static gatherContext(input: ProjectContextInput): string {
    const parts: string[] = [];

    if (input.activeFile) {
      parts.push(`[Active File]: ${input.activeFile}`);
    }
    if (input.selectedCode) {
      parts.push(`[Selected Code]:\n${input.selectedCode}`);
    }
    if (input.terminalErrors && input.terminalErrors.length > 0) {
      parts.push(`[Terminal Diagnostics]:\n${input.terminalErrors.join('\n')}`);
    }
    if (input.openFiles && input.openFiles.length > 0) {
      parts.push(`[Open Files in Tabs]: ${input.openFiles.join(', ')}`);
    }

    parts.push(`[User Request]: ${input.userPrompt}`);
    return parts.join('\n\n');
  }
}
