import * as fs from "fs-extra";
import * as path from "node:path";

/**
 * Finds the workspace root by searching upward
 * until it finds pnpm-workspace.yaml.
 */
async function findWorkspaceRoot(startDir: string): Promise<string> {
  let current = startDir;

  while (true) {
    const workspaceFile = path.join(current, "pnpm-workspace.yaml");

    if (await fs.pathExists(workspaceFile)) {
      return current;
    }

    const parent = path.dirname(current);

    if (parent === current) {
      throw new Error(
        "Could not find pnpm-workspace.yaml. Are you inside the Resolve workspace?"
      );
    }

    current = parent;
  }
}

export async function newCategory(name: string) {
  const workspaceRoot = await findWorkspaceRoot(process.cwd());

  const repositoryPath = path.join(
    workspaceRoot,
    "packages",
    "blocker-engine",
    "repository"
  );

  const categoryPath = path.join(repositoryPath, name);

  if (await fs.pathExists(categoryPath)) {
    console.log(`⚠️ Category '${name}' already exists.`);
    return;
  }

  await fs.ensureDir(categoryPath);

  const template = {
    version: 1,
    domains: []
  };

  await fs.writeJson(
    path.join(categoryPath, "latest.json"),
    template,
    { spaces: 2 }
  );

  await fs.writeJson(
    path.join(categoryPath, "v1.json"),
    template,
    { spaces: 2 }
  );

  const manifestPath = path.join(repositoryPath, "manifest.json");

  const manifest = await fs.readJson(manifestPath);

  if (!manifest.categories) {
    manifest.categories = {};
  }

  manifest.categories[name] = 1;

  await fs.writeJson(manifestPath, manifest, {
    spaces: 2
  });

  console.log(`✅ Created category '${name}'`);
  console.log("✅ Updated manifest.json");
}