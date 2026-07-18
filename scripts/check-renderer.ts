import { spawn, type ChildProcess } from "node:child_process";
import { createHash } from "node:crypto";
import fs from "node:fs";
import net from "node:net";
import path from "node:path";
import sharp from "sharp";
import {
  publishEntity,
  recordEntityContentReview,
} from "../src/lib/publication";
import {
  assertRendererFixtureEnvironment,
  cleanupRendererFixture,
  createRendererFixture,
  seedRendererFixture,
} from "./lib/renderer-fixture";

const ROOT = process.cwd();
const ARTIFACT_ROOT = path.join(
  ROOT,
  ".planning",
  "phases",
  "20-renderer",
  "artifacts",
);
const IDLE_TIMEOUT_MS = 8 * 60_000;

type RendererSpec = "renderer" | "boundary";
type RendererProject = "desktop" | "mobile";

export type RendererCheckOptions = {
  intent: "renderer-fixture";
  spec: RendererSpec;
  projects: readonly RendererProject[];
  grep?: string;
  evidenceDir?: string;
  env?: NodeJS.ProcessEnv;
};

type AssetEvidence = {
  entityId: string;
  name: string;
  imageUrl: string;
  sha256: string;
  attribution: string;
  license: string;
  sourceUrl: string;
};

type AssetManifest = { brand: AssetEvidence; model: AssetEvidence };

function requireSafeInput(options: RendererCheckOptions): string {
  const env = options.env ?? process.env;
  if (options.intent !== "renderer-fixture") {
    throw new Error("Renderer check requires explicit renderer-fixture intent.");
  }
  if (env.TURSO_DATABASE_URL?.trim() || env.TURSO_AUTH_TOKEN?.trim()) {
    throw new Error("Renderer check forbids inherited remote database credentials.");
  }
  if (env.E2E_BASE_URL?.trim()) {
    throw new Error("Renderer check forbids an inherited E2E_BASE_URL.");
  }
  if (env.FPKG_DATABASE_URL?.trim()) {
    throw new Error("Renderer check forbids an inherited catalog database.");
  }
  if (
    options.projects.length === 0 ||
    options.projects.some(
      (project, index) =>
        !["desktop", "mobile"].includes(project) ||
        options.projects.indexOf(project) !== index,
    )
  ) {
    throw new Error("Renderer check projects must be unique desktop/mobile values.");
  }
  if (options.spec === "boundary" && options.projects.join(",") !== "desktop") {
    throw new Error("Renderer boundary mode is desktop-only.");
  }
  const evidenceDir = path.resolve(options.evidenceDir ?? ARTIFACT_ROOT);
  if (
    evidenceDir !== ARTIFACT_ROOT &&
    !evidenceDir.startsWith(`${ARTIFACT_ROOT}${path.sep}`)
  ) {
    throw new Error("Renderer evidence directory must remain in the Phase 20 artifact root.");
  }
  assertRendererFixtureEnvironment({
    ...env,
    TURSO_DATABASE_URL: "",
    TURSO_AUTH_TOKEN: "",
    FPKG_DATABASE_URL: "",
    E2E_BASE_URL: "",
    RENDERER_FIXTURE: "1",
  });
  return evidenceDir;
}

function fixtureSvg(name: string, kind: "brand" | "model"): string {
  const safeName = name
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
  const subtitle = kind === "brand" ? "BRAND ARCHIVE FIXTURE" : "MODEL 01 · NIB / CAP / BODY";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="700" viewBox="0 0 1200 700">
    <rect width="1200" height="700" fill="#f4efe5"/>
    <rect x="52" y="52" width="1096" height="596" rx="24" fill="#fffdf8" stroke="#c9bda8" stroke-width="4"/>
    <text x="600" y="155" text-anchor="middle" font-family="Arial, sans-serif" font-size="25" letter-spacing="5" fill="#786d5d">${subtitle}</text>
    <g transform="translate(160 285)">
      <rect x="0" y="60" width="720" height="78" rx="39" fill="#24343b"/>
      <rect x="85" y="73" width="455" height="52" rx="26" fill="#4d646a"/>
      <path d="M720 60 L860 99 L720 138 Z" fill="#c59b53"/>
      <path d="M720 78 L805 99 L720 120 Z" fill="#f5dfac"/>
      <circle cx="770" cy="99" r="8" fill="#71532d"/>
      <rect x="22" y="42" width="17" height="114" rx="8" fill="#c59b53"/>
    </g>
    <text x="600" y="555" text-anchor="middle" font-family="Arial, sans-serif" font-size="46" font-weight="700" fill="#27363b">${safeName}</text>
    <text x="600" y="600" text-anchor="middle" font-family="Arial, sans-serif" font-size="22" fill="#786d5d">Synthetic CC0 renderer evidence · entity exact</text>
  </svg>`;
}

async function writeFixtureAssets(
  modelSlugs: readonly string[],
): Promise<{ manifest: AssetManifest; cleanup: () => void }> {
  const assetDir = path.join(ROOT, "public", "images", "renderer-fixture");
  if (fs.existsSync(assetDir)) {
    throw new Error("Renderer fixture asset directory already exists; refusing to overwrite it.");
  }
  fs.mkdirSync(assetDir, { recursive: true });
  const rows = [
    { slug: "renderer-brand", name: "Renderer 测试品牌", kind: "brand" as const },
    ...modelSlugs.map((slug, index) => ({
      slug,
      name: `Renderer 型号 ${String(index + 1).padStart(2, "0")}`,
      kind: "model" as const,
    })),
  ];
  try {
    for (const row of rows) {
      await sharp(Buffer.from(fixtureSvg(row.name, row.kind)))
        .jpeg({ quality: 91, chromaSubsampling: "4:4:4" })
        .toFile(path.join(assetDir, `${row.slug}.jpg`));
    }
    const evidence = (entityId: string, name: string): AssetEvidence => {
      const bytes = fs.readFileSync(path.join(assetDir, `${entityId}.jpg`));
      return {
        entityId,
        name,
        imageUrl: `/images/renderer-fixture/${entityId}.jpg`,
        sha256: createHash("sha256").update(bytes).digest("hex"),
        attribution: "Renderer fixture · CC0",
        license: "CC0",
        sourceUrl: `https://renderer.invalid/media/${entityId}`,
      };
    };
    return {
      manifest: {
        brand: evidence("renderer-brand", "Renderer 测试品牌"),
        model: evidence("renderer-model-01", "Renderer 型号 01"),
      },
      cleanup: () => fs.rmSync(assetDir, { recursive: true, force: true }),
    };
  } catch (error) {
    fs.rmSync(assetDir, { recursive: true, force: true });
    throw error;
  }
}

function pipeChild(child: ChildProcess): () => number {
  let lastOutput = Date.now();
  const forward = (target: NodeJS.WriteStream) => (chunk: Buffer) => {
    lastOutput = Date.now();
    target.write(chunk);
  };
  child.stdout?.on("data", forward(process.stdout));
  child.stderr?.on("data", forward(process.stderr));
  return () => lastOutput;
}

async function runCommand(
  command: string,
  args: string[],
  env: NodeJS.ProcessEnv,
): Promise<void> {
  const child = spawn(command, args, {
    cwd: ROOT,
    env,
    stdio: ["ignore", "pipe", "pipe"],
  });
  const lastOutput = pipeChild(child);
  const timer = setInterval(() => {
    if (Date.now() - lastOutput() > IDLE_TIMEOUT_MS) child.kill("SIGTERM");
  }, 5_000);
  const exit = await new Promise<{ code: number | null; signal: NodeJS.Signals | null }>(
    (resolve, reject) => {
      child.once("error", reject);
      child.once("exit", (code, signal) => resolve({ code, signal }));
    },
  ).finally(() => clearInterval(timer));
  if (exit.code !== 0) {
    throw new Error(
      `${command} ${args.join(" ")} failed (${exit.signal ?? exit.code ?? "unknown"}).`,
    );
  }
}

async function getLoopbackPort(): Promise<number> {
  return await new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      if (!address || typeof address === "string") {
        server.close();
        reject(new Error("Could not allocate a loopback port."));
        return;
      }
      server.close((error) => (error ? reject(error) : resolve(address.port)));
    });
  });
}

async function waitForReady(child: ChildProcess, baseUrl: string): Promise<void> {
  const deadline = Date.now() + 60_000;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) throw new Error("Renderer fixture server exited before readiness.");
    try {
      const response = await fetch(`${baseUrl}/brand/renderer-brand`, {
        redirect: "manual",
        signal: AbortSignal.timeout(5_000),
      });
      if (response.status === 200) return;
    } catch {
      // The explicit loopback child may still be starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error("Renderer fixture server readiness timed out.");
}

async function stopServer(child: ChildProcess): Promise<void> {
  if (child.exitCode !== null) return;
  child.kill("SIGTERM");
  await Promise.race([
    new Promise<void>((resolve) => child.once("exit", () => resolve())),
    new Promise<void>((resolve) => setTimeout(resolve, 10_000)),
  ]);
  if (child.exitCode === null) child.kill("SIGKILL");
}

export async function runRendererCheck(
  options: RendererCheckOptions,
): Promise<{ assets: AssetManifest; screenshots: string[] }> {
  const evidenceDir = requireSafeInput(options);
  fs.mkdirSync(evidenceDir, { recursive: true });
  const fixtureEnv = {
    ...(options.env ?? process.env),
    TURSO_DATABASE_URL: "",
    TURSO_AUTH_TOKEN: "",
    FPKG_DATABASE_URL: "",
    E2E_BASE_URL: "",
    PUBLICATION_GATE_FIXTURE: "1",
    RENDERER_FIXTURE: "1",
  };
  const fixture = await createRendererFixture(fixtureEnv);
  let assets: Awaited<ReturnType<typeof writeFixtureAssets>> | undefined;
  let server: ChildProcess | undefined;
  try {
    const seed = await seedRendererFixture(fixture);
    assets = await writeFixtureAssets(seed.modelSlugs);
    await fixture.client.execute(`
      UPDATE media_assets
      SET local_path = 'public/images/renderer-fixture/' ||
        (SELECT entity.slug FROM entities entity WHERE entity.id = media_assets.entity_id) ||
        '.jpg'
      WHERE entity_id = 'renderer-brand'
         OR entity_id GLOB 'renderer-model-[0-9][0-9]'
    `);
    for (const entityId of [seed.brandId, ...seed.modelSlugs]) {
      for (const reviewKind of ["fact", "language", "media"] as const) {
        await recordEntityContentReview(fixture.client, {
          entityId,
          reviewKind,
          reviewer: "renderer-fixture-assets",
          status: "approved",
          notes: "Fixture-only asset path review after owned asset creation.",
        });
      }
      await publishEntity(fixture.client, {
        entityId,
        reviewer: "renderer-fixture-assets",
      });
    }
    const childBaseEnv: NodeJS.ProcessEnv = {
      ...fixture.env,
      TURSO_DATABASE_URL: "",
      TURSO_AUTH_TOKEN: "",
      FPKG_DATABASE_URL: fixture.databaseUrl,
      PUBLICATION_GATE_FIXTURE: "1",
      RENDERER_FIXTURE: "1",
      E2E_BASE_URL: "",
    };
    await runCommand("pnpm", ["build"], childBaseEnv);

    const port = await getLoopbackPort();
    const baseUrl = `http://127.0.0.1:${port}`;
    server = spawn(
      "pnpm",
      ["check:publication-gate", "--", "--serve-e2e", "--port", String(port)],
      { cwd: ROOT, env: childBaseEnv, stdio: ["ignore", "pipe", "pipe"] },
    );
    pipeChild(server);
    await waitForReady(server, baseUrl);

    const playwrightArgs = [
      "exec",
      "playwright",
      "test",
      "tests/e2e/renderer.spec.ts",
      "--workers=1",
      `--grep=${options.grep ?? (options.spec === "renderer" ? "@renderer" : "@boundary")}`,
      ...options.projects.map((project) => `--project=${project}`),
    ];
    await runCommand("pnpm", playwrightArgs, {
      ...childBaseEnv,
      E2E_BASE_URL: baseUrl,
      RENDERER_EVIDENCE_DIR: evidenceDir,
      RENDERER_ASSET_MANIFEST_JSON: JSON.stringify(assets.manifest),
    });

    const screenshots =
      options.spec === "renderer"
        ? options.projects.flatMap((project) => [
            path.join(evidenceDir, `brand-${project}.png`),
            path.join(evidenceDir, `model-${project}.png`),
          ])
        : [];
    for (const screenshot of screenshots) {
      if (!fs.existsSync(screenshot) || fs.statSync(screenshot).size === 0) {
        throw new Error(`Renderer screenshot is missing or empty: ${screenshot}`);
      }
    }
    return { assets: assets.manifest, screenshots };
  } finally {
    if (server) await stopServer(server);
    assets?.cleanup();
    await cleanupRendererFixture(fixture);
  }
}

function optionValue(args: string[], name: string): string | undefined {
  const equals = args.find((arg) => arg.startsWith(`${name}=`));
  if (equals) return equals.slice(name.length + 1);
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : undefined;
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const spec = optionValue(args, "--spec") as RendererSpec | undefined;
  const rawProjects = optionValue(args, "--project");
  if (!spec || !["renderer", "boundary"].includes(spec) || !rawProjects) {
    throw new Error(
      "Usage: pnpm exec tsx scripts/check-renderer.ts --spec=renderer|boundary --project=desktop|mobile|desktop,mobile [--grep=...] [--evidence-dir=...]",
    );
  }
  const projects = rawProjects.split(",") as RendererProject[];
  const result = await runRendererCheck({
    intent: "renderer-fixture",
    spec,
    projects,
    grep: optionValue(args, "--grep"),
    evidenceDir: optionValue(args, "--evidence-dir"),
  });
  console.log(`RENDERER_CHECK_RESULT ${JSON.stringify(result)}`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
