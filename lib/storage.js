import { getSupabase } from './db.js';

export const STORAGE_BUCKET = 'kaksha-files';

// Allowed file extensions and MIME types
export const ALLOWED_EXTENSIONS = ['pdf', 'docx', 'pptx', 'png', 'jpg', 'jpeg', 'zip'];
export const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024; // 20MB limit

// Validate file extension against allowed types
export function isAllowedFileType(filename) {
  if (!filename || typeof filename !== 'string') return false;
  const parts = filename.split('.');
  if (parts.length < 2) return false;
  const ext = parts.pop().toLowerCase();
  return ALLOWED_EXTENSIONS.includes(ext);
}

// Generate a signed upload URL so browser can upload directly to Supabase Storage
// avoiding Vercel's 4.5MB serverless body limit
export async function createUploadUrl(filePath) {
  const supabase = getSupabase();
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .createSignedUploadUrl(filePath);

  if (error) {
    throw error;
  }

  return {
    signedUrl: data.signedUrl,
    token: data.token,
    path: data.path,
  };
}

// Generate a short-lived (60 seconds) signed download URL after access checks pass
export async function createDownloadUrl(filePath, expiresInSeconds = 60) {
  const supabase = getSupabase();
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .createSignedUrl(filePath, expiresInSeconds);

  if (error) {
    throw error;
  }

  return data.signedUrl;
}
