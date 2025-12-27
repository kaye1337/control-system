import { put, del } from '@vercel/blob';

/**
 * Storage Service Abstraction
 * 
 * Currently implemented using Vercel Blob.
 * In the future, if you need more space (e.g. Cloudflare R2 or AWS S3),
 * you only need to modify this file.
 */

export async function uploadToStorage(file: File, filename: string): Promise<string> {
  // Check token
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error('服务器未配置存储 Token (BLOB_READ_WRITE_TOKEN)');
  }

  // Upload to Vercel Blob
  const blob = await put(filename, file, {
    access: 'public',
  });

  return blob.url;
}

export async function deleteFromStorage(url: string): Promise<void> {
  // Only try to delete if it looks like a remote URL (and specifically a Vercel Blob URL ideally)
  if (url.startsWith('http')) {
      try {
        await del(url);
      } catch (error) {
        console.error('Failed to delete blob:', url, error);
        // We suppress the error to allow DB deletion to proceed
      }
  }
}
