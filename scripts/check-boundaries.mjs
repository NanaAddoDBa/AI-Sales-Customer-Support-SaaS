import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const normalize = (value) => value.replaceAll("\\", "/");
const browserRoots = [
  "apps/dashboard/",
  "apps/widget/",
  "packages/ui/",
  "packages/sdk/",
  "packages/contracts/",
];
const serverPackages = [
  "backend",
  "database",
  "config",
  "observability",
  "testing",
];
export function inspectImport(file, specifier) {
  file = normalize(file);
  const target = specifier.startsWith(".")
    ? normalize(
        path.posix.normalize(
          path.posix.join(path.posix.dirname(file), specifier),
        ),
      )
    : specifier;
  if (
    browserRoots.some((root) => file.startsWith(root)) &&
    (serverPackages.some(
      (name) =>
        target.startsWith(`@sales-support/${name}`) ||
        target.startsWith(`packages/${name}/`),
    ) ||
      target.startsWith("node:"))
  )
    return "Browser code cannot import server code";
  if (
    file.startsWith("packages/ui/") &&
    (target.startsWith("apps/") ||
      (target.startsWith("@sales-support/") &&
        !target.startsWith("@sales-support/ui")))
  )
    return "Shared UI cannot import business packages";
  if (
    /\/domain\//.test(file) &&
    (!specifier.startsWith(".") ||
      /\/(infrastructure|http|application|ports)\//.test(target))
  )
    return "Domain code must remain independent";
  const owner = file.match(/packages\/backend\/src\/modules\/([^/]+)\//)?.[1];
  const destination = target.match(
    /packages\/backend\/src\/modules\/([^/]+)\/(.*)/,
  );
  if (
    owner &&
    destination &&
    owner !== destination[1] &&
    destination[2] !== "index.js" &&
    destination[2] !== "index.ts"
  )
    return "Cross-module imports must use the public index";
  if (
    specifier.startsWith("@sales-support/") &&
    specifier.split("/").length > 2
  )
    return "Package imports must use public exports";
  if (specifier.startsWith(".") && /^(apps|packages)\//.test(file)) {
    const root = file.split("/").slice(0, 2).join("/") + "/";
    if (!target.startsWith(root))
      return "Cross-package relative imports are forbidden";
  }
  return null;
}
export function findCycles(graph) {
  const visiting = new Set();
  const visited = new Set();
  function visit(node) {
    if (visiting.has(node)) throw new Error(`Dependency cycle at ${node}`);
    if (visited.has(node)) return;
    visiting.add(node);
    for (const edge of graph.get(node) ?? []) if (graph.has(edge)) visit(edge);
    visiting.delete(node);
    visited.add(node);
  }
  for (const node of graph.keys()) visit(node);
}
function files(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const name = normalize(path.join(directory, entry.name));
    if (["node_modules", "dist", ".turbo"].includes(entry.name)) return [];
    return entry.isDirectory() ? files(name) : [name];
  });
}
export function checkWorkspace() {
  const sourceFiles = ["apps", "packages"].flatMap(files);
  const graph = new Map();
  const errors = [];
  for (const file of sourceFiles.filter((file) => /\.tsx?$/.test(file))) {
    const source = ts.createSourceFile(
      file,
      fs.readFileSync(file, "utf8"),
      ts.ScriptTarget.Latest,
      true,
    );
    const imports = [];
    function visit(node) {
      if (
        (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
        node.moduleSpecifier &&
        ts.isStringLiteral(node.moduleSpecifier)
      )
        imports.push(node.moduleSpecifier.text);
      if (
        ts.isCallExpression(node) &&
        (node.expression.kind === ts.SyntaxKind.ImportKeyword ||
          node.expression.getText(source) === "require")
      ) {
        if (node.arguments[0] && ts.isStringLiteral(node.arguments[0]))
          imports.push(node.arguments[0].text);
        else
          errors.push(
            `${file}: computed imports require an explicit architecture review`,
          );
      }
      ts.forEachChild(node, visit);
    }
    visit(source);
    for (const specifier of imports) {
      const error = inspectImport(file, specifier);
      if (error) errors.push(`${file}: ${specifier}: ${error}`);
    }
    graph.set(
      file,
      imports
        .filter((item) => item.startsWith("."))
        .map((item) =>
          normalize(path.join(path.dirname(file), item)).replace(
            /\.js$/,
            ".ts",
          ),
        )
        .map((item) =>
          fs.existsSync(item) ? item : item.replace(/\.ts$/, ".tsx"),
        ),
    );
  }
  const packageGraph = new Map();
  for (const file of sourceFiles.filter((file) =>
    file.endsWith("/package.json"),
  )) {
    const manifest = JSON.parse(fs.readFileSync(file, "utf8"));
    const dependencies = Object.keys({
      ...manifest.dependencies,
      ...manifest.devDependencies,
    });
    packageGraph.set(manifest.name, dependencies);
    if (browserRoots.some((root) => file.startsWith(root)))
      for (const name of serverPackages)
        if (dependencies.includes(`@sales-support/${name}`))
          errors.push(`${file}: server dependency ${name}`);
  }
  findCycles(graph);
  findCycles(packageGraph);
  if (errors.length) throw new Error(errors.join("\n"));
  return sourceFiles.length;
}
if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
)
  console.log(`Boundaries passed (${checkWorkspace()} files inspected)`);
