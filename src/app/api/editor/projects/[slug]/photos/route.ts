import fs from "node:fs/promises";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { orderedProjects, toJsonError } from "@/app/api/editor/_helpers";
import {
  mediaAbsolutePathFromSrc,
  projectMediaDirectory,
  readContentBundle,
  readProject,
  rebuildGeneratedSiteData,
  writeProject,
} from "@/lib/content-store";
import { editorGuardResponse } from "@/lib/editor-guard";

const ALLOWED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"]);
export const runtime = "nodejs";

type ProjectPhotosRouteParams = {
  params: Promise<{ slug: string }>;
};

function nextImageFileName(existingSrcs: string[], fileExtension: string) {
  const existingIndex = existingSrcs
    .map((src) => path.basename(src, path.extname(src)))
    .map((name) => Number.parseInt(name, 10))
    .filter((value) => Number.isInteger(value));

  const nextIndex = existingIndex.length > 0 ? Math.max(...existingIndex) + 1 : 1;
  const width = Math.max(2, `${nextIndex}`.length);
  return `${String(nextIndex).padStart(width, "0")}${fileExtension}`;
}

export async function POST(request: NextRequest, { params }: ProjectPhotosRouteParams) {
  const guard = editorGuardResponse();
  if (guard) {
    return guard;
  }

  try {
    const { slug } = await params;
    const formData = await request.formData();
    const file = formData.get("file");
    const rawAlt = formData.get("alt");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "file is required" }, { status: 400 });
    }

    const extension = path.extname(file.name).toLowerCase() || ".jpg";
    if (!ALLOWED_EXTENSIONS.has(extension)) {
      return NextResponse.json({ error: `Unsupported file extension: ${extension}` }, { status: 400 });
    }

    const alt = typeof rawAlt === "string" && rawAlt.trim().length > 0 ? rawAlt.trim() : file.name;
    const project = await readProject(slug);

    await fs.mkdir(projectMediaDirectory(slug), { recursive: true });

    const fileName = nextImageFileName(
      project.images.map((image) => image.src),
      extension,
    );
    const src = `/media/projects/${slug}/${fileName}`;
    const outputPath = mediaAbsolutePathFromSrc(src);
    const buffer = Buffer.from(await file.arrayBuffer());
    const metadata = await sharp(buffer).metadata();

    if (!metadata.width || !metadata.height) {
      return NextResponse.json({ error: "Unable to infer image dimensions from upload" }, { status: 400 });
    }

    await fs.writeFile(outputPath, buffer);

    const newImage = {
      src,
      width: metadata.width,
      height: metadata.height,
      alt,
    };

    const nextProject = {
      ...project,
      images: [...project.images, newImage],
      coverImage: project.coverImage ?? newImage,
    };

    const { workspace } = await readContentBundle();
    await writeProject(nextProject, workspace.categories);
    await rebuildGeneratedSiteData();

    const updated = await readContentBundle();
    return NextResponse.json({
      workspace: updated.workspace,
      projects: orderedProjects(updated.workspace, updated.projects),
      addedImage: newImage,
    });
  } catch (error) {
    return toJsonError(error);
  }
}
