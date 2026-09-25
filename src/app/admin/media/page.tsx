import { getAllMedia } from "@/lib/media-data";
import { MediaUploadForm } from "./MediaUploadForm";
import { MediaGrid } from "./MediaGrid";

export const dynamic = "force-dynamic";

export default async function AdminMediaPage() {
  const { data: media, error } = await getAllMedia();

  return (
    <div>
      <h1 className="text-xl font-bold text-text">Media Library</h1>
      <p className="mt-1 text-sm text-muted">
        Images for guide covers, template previews, and logos. PNG, JPEG, WebP or SVG, up to 5 MB.
      </p>

      {error && (
        <p className="mt-4 text-sm text-danger">
          Couldn't load media ({error.message}). Make sure phase6-schema.sql has been run and the "media" storage
          bucket has been created (see README).
        </p>
      )}

      <div className="mt-6">
        <MediaUploadForm />
      </div>

      <div className="mt-8">
        <MediaGrid items={media} />
      </div>
    </div>
  );
}
