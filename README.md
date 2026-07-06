# CLI Dock

CLI Dock is a small VS Code extension that launches CLI tools from editor title buttons.

## Features

- Adds editor title buttons for `lazygit`, `opencode`, `codex`, and `claude`.
- Open an integrated terminal in the current editor group and run the selected command immediately.
- Uses bundled command icons for a compact native toolbar experience.

## Development

```bash
pnpm install
pnpm run build
```

Press F5 in VS Code and choose `Run Extension`.

## Publishing

```bash
pnpm run build
pnpm dlx @vscode/vsce package
pnpm dlx @vscode/vsce publish
```
