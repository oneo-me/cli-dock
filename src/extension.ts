import * as vscode from "vscode";
import { registerCliCommands } from "./cliCommands";
import { registerGitHubRepositoryCommand } from "./githubRepository";

export function activate(context: vscode.ExtensionContext) {
  registerCliCommands(context);
  registerGitHubRepositoryCommand(context);
}

export function deactivate() {}
