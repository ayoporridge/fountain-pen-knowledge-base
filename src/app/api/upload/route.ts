import fs from "node:fs";
import path from "node:path";
import { nanoid } from "nanoid";
import { type NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { verifyWriteAccess } from "@/lib/admin-auth";

const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");
const THUMBS_DIR = path.join(UPLOADS_DIR, "thumbs");
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const THUMB_WIDTH = 400;
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

function ensureDirs() {
  if (!fs.existsSync(UPLOADS_DIR))
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  if (!fs.existsSync(THUMBS_DIR)) fs.mkdirSync(THUMBS_DIR, { recursive: true });
}

// POST /api/upload
export async function POST(request: NextRequest) {
  const deny = verifyWriteAccess(request);
  if (deny) return deny;

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        {
          error: `Unsupported file type: ${file.type}. Allowed: JPEG, PNG, WebP, GIF`,
        },
        { status: 400 },
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File too large. Max size: ${MAX_FILE_SIZE / 1024 / 1024}MB` },
        { status: 400 },
      );
    }

    // Validate original filename — reject path traversal attempts
    if (
      file.name.includes("..") ||
      file.name.includes("/") ||
      file.name.includes("\\") ||
      path.isAbsolute(file.name)
    ) {
      return NextResponse.json({ error: "Invalid filename" }, { status: 400 });
    }

    ensureDirs();

    // Generate unique filename — use only a safe alphanumeric extension
    const rawExt = file.name.split(".").pop() || "jpg";
    const ext = rawExt.replace(/[^a-zA-Z0-9]/g, "").slice(0, 10) || "jpg";
    const id = nanoid(12);
    const filename = `${id}.${ext}`;
    const thumbFilename = `${id}_thumb.webp`;

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Save original
    const filePath = path.join(UPLOADS_DIR, filename);
    fs.writeFileSync(filePath, buffer);

    // Generate thumbnail (WebP, 400px wide, auto height)
    const thumbPath = path.join(THUMBS_DIR, thumbFilename);
    await sharp(buffer)
      .resize({ width: THUMB_WIDTH, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(thumbPath);

    return NextResponse.json({
      url: `/uploads/${filename}`,
      thumbnail: `/uploads/thumbs/${thumbFilename}`,
      filename,
      size: file.size,
      type: file.type,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Upload error:", message);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
