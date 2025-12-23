import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Wallpaper from '@/lib/models/Wallpaper';
import Title from '@/lib/models/Title';
import { requireAuth } from '@/lib/adminAuth';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { validateFileType, validateFileSize } from '@/lib/utils';
import { checkRateLimit } from '@/lib/rateLimit';
import { getSession } from '@/lib/session';

// POST - Upload wallpapers
export async function POST(request: NextRequest) {
  const authError = await requireAuth();
  if (authError) return authError;

  try {
    // Rate limiting for uploads
    const session = await getSession();
    const identifier = session.username || 'admin';
    const rateLimitResult = await checkRateLimit(identifier, 'upload');

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: `Upload limit exceeded. Try again in ${Math.ceil(rateLimitResult.retryAfter! / 60)} minutes.`,
        },
        { status: 429 }
      );
    }

    const formData = await request.formData();
    const titleId = formData.get('titleId') as string;
    const files = formData.getAll('wallpapers') as File[];

    if (!titleId || files.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Title ID and at least one wallpaper are required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Verify title exists
    const title = await Title.findById(titleId);
    if (!title) {
      return NextResponse.json(
        { success: false, message: 'Title not found' },
        { status: 404 }
      );
    }

    // Validate and upload files
    const uploadedWallpapers = [];

    for (const file of files) {
      if (!validateFileType(file)) {
        return NextResponse.json(
          { success: false, message: `Invalid file type for ${file.name}. Only JPEG, PNG, and WebP are allowed.` },
          { status: 400 }
        );
      }

      if (!validateFileSize(file)) {
        return NextResponse.json(
          { success: false, message: `File ${file.name} exceeds 10MB limit.` },
          { status: 400 }
        );
      }

      const wallpaperData = await uploadToCloudinary(file, 'wallpapers');

      const newWallpaper = await Wallpaper.create({
        titleId,
        imageUrl: wallpaperData.url,
        originalUrl: wallpaperData.originalUrl,
        publicId: wallpaperData.publicId,
        downloadCount: 0,
      });

      uploadedWallpapers.push(newWallpaper);
    }

    // Update title's updatedAt timestamp
    title.updatedAt = new Date();
    await title.save();

    return NextResponse.json({
      success: true,
      data: uploadedWallpapers,
      message: `${uploadedWallpapers.length} wallpaper(s) uploaded successfully`,
    });
  } catch (error) {
    console.error('Upload wallpapers error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to upload wallpapers' },
      { status: 500 }
    );
  }
}