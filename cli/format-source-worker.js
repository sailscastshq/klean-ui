import { createRequire } from "node:module";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import * as bundledPrettier from "prettier";

const localRequire = createRequire(import.meta.url);

function resolveFromProject(requireFromProject, dependency) {
  try {
    return requireFromProject.resolve(dependency);
  } catch {
    return undefined;
  }
}

function resolveDependency(requireFromProject, dependency) {
  const projectPath = resolveFromProject(requireFromProject, dependency);
  if (projectPath) return projectPath;

  try {
    return localRequire.resolve(dependency);
  } catch {
    return undefined;
  }
}

async function applicationPrettier(requireFromProject) {
  const prettierPath = resolveFromProject(requireFromProject, "prettier");
  if (!prettierPath) return bundledPrettier;

  const imported = await import(pathToFileURL(prettierPath).href);
  return imported.default?.format ? imported.default : imported;
}

export default async function formatSource({
  applicationRoot,
  source,
  targetPath,
}) {
  const requireFromProject = createRequire(
    resolve(applicationRoot, "package.json"),
  );
  const prettier = await applicationPrettier(requireFromProject);
  const config = (await prettier.resolveConfig(targetPath, {
    editorconfig: true,
  })) ?? { plugins: [] };
  const plugins = [...(config.plugins ?? [])];

  if (targetPath.endsWith(".svelte") && plugins.length === 0) {
    const pluginPath = resolveDependency(
      requireFromProject,
      "prettier-plugin-svelte",
    );
    if (pluginPath) plugins.push(await import(pluginPath));
  }

  return prettier.format(source, {
    ...config,
    filepath: targetPath,
    plugins,
  });
}
