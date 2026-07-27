import fs from "node:fs";
import path from "node:path";

const workspaceRoot = process.cwd();
const standaloneRoot = path.join(workspaceRoot, ".next", "standalone");

function nativeTarget(): string {
  const platform = process.platform;
  const arch = process.arch;
  if (platform === "darwin") return arch === "arm64" ? "darwin-arm64" : "darwin-x64";
  if (platform === "win32") return "win32-x64-msvc";
  if (platform === "linux") {
    const glibc = Boolean(process.report?.getReport().header.glibcVersionRuntime);
    if (arch === "arm64") return glibc ? "linux-arm64-gnu" : "linux-arm64-musl";
    return glibc ? "linux-x64-gnu" : "linux-x64-musl";
  }
  throw new Error(`Unsupported libsql native platform: ${platform}/${arch}`);
}

function findNativePackage(target: string): string {
  const pnpmRoot = path.join(workspaceRoot, "node_modules", ".pnpm");
  const prefix = `@libsql+${target}@`;
  const packageDir = fs
    .readdirSync(pnpmRoot)
    .find((entry) => entry.startsWith(prefix));
  if (!packageDir) {
    throw new Error(`Missing installed libsql native package for ${target}.`);
  }
  const nativeDir = path.join(
    pnpmRoot,
    packageDir,
    "node_modules",
    "@libsql",
    target,
  );
  if (!fs.existsSync(nativeDir)) {
    throw new Error(`Installed libsql native package is incomplete: ${nativeDir}`);
  }
  return nativeDir;
}

function replaceDirectoryLink(destination: string, source: string): void {
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  try {
    fs.lstatSync(destination);
    fs.rmSync(destination, { recursive: true, force: true });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }
  fs.symlinkSync(path.relative(path.dirname(destination), source), destination, "dir");
}

function main(): void {
  if (!fs.existsSync(standaloneRoot)) return;

  const target = nativeTarget();
  const nativeSource = findNativePackage(target);
  const standaloneNative = path.join(
    standaloneRoot,
    "node_modules",
    "@libsql",
    target,
  );
  replaceDirectoryLink(standaloneNative, nativeSource);

  const pnpmRoot = path.join(standaloneRoot, "node_modules", ".pnpm");
  const libsqlPackageDir = fs
    .readdirSync(pnpmRoot)
    .find((entry) => entry.startsWith("libsql@"));
  if (!libsqlPackageDir) {
    throw new Error("Standalone output is missing the libsql package.");
  }
  const nestedNative = path.join(
    pnpmRoot,
    libsqlPackageDir,
    "node_modules",
    "@libsql",
    target,
  );
  replaceDirectoryLink(nestedNative, standaloneNative);
  console.log(`Prepared standalone libsql native runtime: ${target}`);
}

main();
