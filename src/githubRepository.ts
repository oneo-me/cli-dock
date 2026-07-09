import { execFile } from "node:child_process";
import { promisify } from "node:util";
import * as vscode from "vscode";
import { getRepositoryCwd } from "./workspace";

const execFileAsync = promisify(execFile);
const OPEN_GITHUB_REPOSITORY_COMMAND = "cliDock.openGitHubRepository";
const NO_GITHUB_REPOSITORY_MESSAGE = "No GitHub repository was found for the current project.";
const NO_PROJECT_MESSAGE = "Open a folder or file inside a GitHub repository first.";

interface GitRemote {
  readonly name: string;
  readonly url: string;
  readonly type: "fetch" | "push";
}

export function registerGitHubRepositoryCommand(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand(OPEN_GITHUB_REPOSITORY_COMMAND, openGitHubRepository)
  );
}

async function openGitHubRepository() {
  const cwd = getRepositoryCwd();

  if (!cwd) {
    await vscode.window.showInformationMessage(NO_PROJECT_MESSAGE);
    return;
  }

  const repositoryUrl = await findGitHubRepositoryUrl(cwd);

  if (!repositoryUrl) {
    await vscode.window.showInformationMessage(NO_GITHUB_REPOSITORY_MESSAGE);
    return;
  }

  await vscode.env.openExternal(vscode.Uri.parse(repositoryUrl));
}

async function findGitHubRepositoryUrl(cwd: string): Promise<string | undefined> {
  try {
    const { stdout } = await execFileAsync("git", ["remote", "-v"], {
      cwd,
      encoding: "utf8"
    });

    const remotes = parseGitRemotes(stdout);
    const preferredRemotes = remotes.sort((a, b) => getRemotePriority(a) - getRemotePriority(b));

    for (const remote of preferredRemotes) {
      const repositoryUrl = toGitHubWebUrl(remote.url);

      if (repositoryUrl) {
        return repositoryUrl;
      }
    }
  } catch {
    return undefined;
  }

  return undefined;
}

function parseGitRemotes(remoteOutput: string): GitRemote[] {
  return remoteOutput.split(/\r?\n/).flatMap((line) => {
    const match = line.match(/^(\S+)\s+(.+?)\s+\((fetch|push)\)$/);

    if (!match) {
      return [];
    }

    return [
      {
        name: match[1],
        url: match[2],
        type: match[3] as GitRemote["type"]
      }
    ];
  });
}

function getRemotePriority(remote: GitRemote): number {
  if (remote.name === "origin" && remote.type === "fetch") {
    return 0;
  }

  if (remote.type === "fetch") {
    return 1;
  }

  if (remote.name === "origin") {
    return 2;
  }

  return 3;
}

function toGitHubWebUrl(remoteUrl: string): string | undefined {
  const scpLikeMatch = remoteUrl.match(/^(?:[^@]+@)?github\.com:(.+)$/i);

  if (scpLikeMatch) {
    return toGitHubWebUrlFromPath(scpLikeMatch[1]);
  }

  try {
    const parsedUrl = new URL(remoteUrl);

    if (parsedUrl.hostname.toLowerCase() !== "github.com") {
      return undefined;
    }

    return toGitHubWebUrlFromPath(parsedUrl.pathname);
  } catch {
    return undefined;
  }
}

function toGitHubWebUrlFromPath(repositoryPath: string): string | undefined {
  const pathSegments = repositoryPath
    .replace(/^\/+/, "")
    .replace(/\/+$/, "")
    .replace(/\.git$/i, "")
    .split("/")
    .filter(Boolean);

  if (pathSegments.length < 2) {
    return undefined;
  }

  const [owner, repository] = pathSegments;

  return `https://github.com/${owner}/${repository}`;
}
