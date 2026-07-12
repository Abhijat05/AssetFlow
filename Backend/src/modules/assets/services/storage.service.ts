import { supabase } from "../../../lib/supabase.js";
import { env } from "../../../config/env.js";
import { AppError } from "../../../utils/errors.js";

const bucket = env.SUPABASE_STORAGE_BUCKET;

export const storageService = {
  async uploadFile(
    path: string,
    buffer: Buffer,
    contentType: string
  ): Promise<string> {
    const { error } = await supabase.storage
      .from(bucket)
      .upload(path, buffer, { contentType, upsert: true });

    if (error) {
      throw new AppError(`Storage upload failed: ${error.message}`, 500, "STORAGE_ERROR");
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  },

  async deleteFile(path: string): Promise<void> {
    const { error } = await supabase.storage.from(bucket).remove([path]);
    if (error) {
      throw new AppError(`Storage delete failed: ${error.message}`, 500, "STORAGE_ERROR");
    }
  },

  // Extracts the storage path from a full public URL
  extractPath(publicUrl: string): string {
    // URL format: <SUPABASE_URL>/storage/v1/object/public/<bucket>/<path>
    const marker = `/object/public/${bucket}/`;
    const idx = publicUrl.indexOf(marker);
    if (idx === -1) return publicUrl;
    return publicUrl.slice(idx + marker.length);
  },
};
