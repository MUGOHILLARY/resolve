import * as fs from "fs-extra";
import * as path from "node:path";

async function findWorkspaceRoot(startDir: string): Promise<string> {
  let current = startDir;

  while (true) {
    const workspaceFile = path.join(current, "pnpm-workspace.yaml");

    if (await fs.pathExists(workspaceFile)) {
      return current;
    }

    const parent = path.dirname(current);

    if (parent === current) {
      throw new Error("Could not locate the Resolve workspace.");
    }

    current = parent;
  }
}

function report(ok: boolean, label: string) {
  console.log(`${ok ? "✅" : "❌"} ${label}`);
}

export async function doctor() {
  const root = await findWorkspaceRoot(process.cwd());

  console.log("\n🩺 Resolve Doctor\n");

  report(
    await fs.pathExists(path.join(root, "pnpm-workspace.yaml")),
    "Workspace"
  );

  report(
    await fs.pathExists(path.join(root, "apps", "api")),
    "API"
  );

  report(
    await fs.pathExists(path.join(root, "apps", "web")),
    "Web App"
  );

  report(
    await fs.pathExists(path.join(root, "apps", "extension")),
    "Chrome Extension"
  );

  report(
    await fs.pathExists(path.join(root, "packages", "blocker-engine")),
    "Blocker Engine"
  );

  report(
    await fs.pathExists(path.join(root, "packages", "blocklist-manager")),
    "Blocklist Manager"
  );

  report(
    await fs.pathExists(path.join(root, "packages", "resolve-cli")),
    "Resolve CLI"
  );

  report(
    await fs.pathExists(
      path.join(
        root,
        "packages",
        "blocker-engine",
        "repository",
        "manifest.json"
      )
    ),
    "Blocklist Manifest"
  );

  console.log("\n✅ Doctor finished.\n");
}