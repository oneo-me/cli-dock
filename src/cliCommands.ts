import * as vscode from "vscode";
import { getActiveViewColumn, getWorkspaceCwd } from "./workspace";

interface FixedCommand {
  readonly id: string;
  readonly title: string;
  readonly command: string;
}

const FIXED_COMMANDS: FixedCommand[] = [
  {
    id: "cliDock.runLazygit",
    title: "lazygit",
    command: "lazygit"
  },
  {
    id: "cliDock.runOpencode",
    title: "opencode",
    command: "opencode"
  },
  {
    id: "cliDock.runCodex",
    title: "codex",
    command: "codex"
  },
  {
    id: "cliDock.runClaude",
    title: "claude",
    command: "claude"
  },
  {
    id: "cliDock.runCursor",
    title: "cursor",
    command: "cursor-agent"
  },
  {
    id: "cliDock.runGrok",
    title: "grok",
    command: "grok"
  }
];

export function registerCliCommands(context: vscode.ExtensionContext) {
  for (const fixedCommand of FIXED_COMMANDS) {
    context.subscriptions.push(
      vscode.commands.registerCommand(fixedCommand.id, () => runFixedCommand(fixedCommand))
    );
  }
}

async function runFixedCommand(fixedCommand: FixedCommand) {
  const terminal = vscode.window.createTerminal({
    name: fixedCommand.title,
    cwd: getWorkspaceCwd(),
    isTransient: true,
    location: {
      viewColumn: getActiveViewColumn(),
      preserveFocus: false
    }
  });

  terminal.show();
  await vscode.commands.executeCommand("workbench.action.unpinEditor");
  terminal.sendText(fixedCommand.command, true);
}
