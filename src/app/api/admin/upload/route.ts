import { put } from "@vercel/blob";
import { adminRoute, blobConfigured } from "@/lib/admin-api";

/*
 * POST /api/admin/upload (multipart, field "file").
 * Stores certificate images and PDFs in Vercel Blob. The declared type, the
 * size and the file's leading bytes all have to agree before anything is
 * stored.
 */

const MAX_BYTES = 4 * 1024 * 1024;

const TYPES: Record<string, { ext: string; magic: (b: Uint8Array) => boolean }> = {
  "image/png": { ext: "png", magic: (b) => b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 },
  "image/jpeg": { ext: "jpg", magic: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  "image/webp": {
    ext: "webp",
    magic: (b) => ascii(b, 0, 4) === "RIFF" && ascii(b, 8, 12) === "WEBP",
  },
  "application/pdf": { ext: "pdf", magic: (b) => ascii(b, 0, 5) === "%PDF-" },
};

function ascii(b: Uint8Array, from: number, to: number) {
  return String.fromCharCode(...b.slice(from, to));
}

export function POST(req: Request) {
  return adminRoute(
    req,
    async () => {
      if (!blobConfigured()) {
        return Response.json({ error: "File storage is not configured (Vercel Blob)" }, { status: 503 });
      }
      const form = await req.formData();
      const file = form.get("file");
      if (!(file instanceof File)) return Response.json({ error: "No file" }, { status: 400 });
      const kind = TYPES[file.type];
      if (!kind) return Response.json({ error: "Only PNG, JPEG, WebP or PDF" }, { status: 415 });
      if (file.size > MAX_BYTES) return Response.json({ error: "File is larger than 4 MB" }, { status: 413 });

      const bytes = new Uint8Array(await file.arrayBuffer());
      if (!kind.magic(bytes)) return Response.json({ error: "File content does not match its type" }, { status: 415 });

      const base =
        file.name
          .replace(/\.[^.]+$/, "")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "")
          .slice(0, 40) || "file";
      const blob = await put(`uploads/${base}.${kind.ext}`, Buffer.from(bytes), {
        access: "public",
        addRandomSuffix: true,
        contentType: file.type,
      });
      return Response.json({ url: blob.url }, { status: 201 });
    },
    { write: false },
  );
}
