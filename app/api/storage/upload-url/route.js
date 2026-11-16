import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { createUploadUrl, isAllowedFileType, MAX_FILE_SIZE_BYTES } from '@/lib/storage';

// Generate a signed upload URL so student or teacher can upload directly to Supabase Storage
// Bypasses Vercel's 4.5MB serverless body limit
export async function POST(request) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
  }

  try {
    const { filename, folder = 'general' } = await request.json();

    if (!filename || !isAllowedFileType(filename)) {
      return NextResponse.json(
        { error: 'Invalid file type. Allowed: pdf, docx, pptx, png, jpg, zip.' },
        { status: 400 }
      );
    }

    const safeFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
    const uniquePath = `${folder}/${user.id}_${Date.now()}_${safeFilename}`;

    const uploadData = await createUploadUrl(uniquePath);

    return NextResponse.json({
      uploadUrl: uploadData.signedUrl,
      filePath: uniquePath,
      token: uploadData.token,
      maxSizeBytes: MAX_FILE_SIZE_BYTES,
    });
  } catch (err) {
    console.error('Create upload URL error:', err);
    return NextResponse.json({ error: 'Failed to create upload authorization.' }, { status: 500 });
  }
}
