import * as path from "node:path";
import * as vscode from "vscode";

export function getWorkspaceCwd(): string | undefined {
  return vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
}

export function getRepositoryCwd(): string | undefined {
  const activeDocumentUri = vscode.window.activeTextEditor?.document.uri;

  if (activeDocumentUri?.scheme === "file") {
    return path.dirname(activeDocumentUri.fsPath);
  }

  return getWorkspaceCwd();
}

export function getActiveViewColumn(): vscode.ViewColumn {
  return vscode.window.activeTextEditor?.viewColumn ?? vscode.ViewColumn.Active;
}
