import * as vscode from "vscode";

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
  }
];

export function activate(context: vscode.ExtensionContext) {
  for (const fixedCommand of FIXED_COMMANDS) {
    context.subscriptions.push(
      vscode.commands.registerCommand(fixedCommand.id, () => runFixedCommand(fixedCommand))
    );
  }
}

export function deactivate() {}

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

function getWorkspaceCwd(): string | undefined {
  return vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
}

function getActiveViewColumn(): vscode.ViewColumn {
  return vscode.window.activeTextEditor?.viewColumn ?? vscode.ViewColumn.Active;
}
