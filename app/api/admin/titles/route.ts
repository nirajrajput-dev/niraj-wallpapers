import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Title from '@/lib/models/Title';
import { requireAuth } from '@/lib/adminAuth';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { generateUniqueSlug, validateFileType, validateFileSize } from '@/lib/utils';

// GET - Fetch all titles (admin view)
export async function GET() {
  const authError = await requireAuth();
  if (authError) return authError;

  try {
    await connectDB();
    const titles = await Title.find().sort({ updatedAt: -1 });

    return NextResponse.json({
      success: true,
      data: titles,
    });
  } catch (error) {
    console.error('Fetch titles error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch titles' },
      { status: 500 }
    );
  }
}

// POST - Create new title
export async function POST(request: NextRequest) {
  const authError = await requireAuth();
  if (authError) return authError;

  try {
    const formData = await request.formData();
    const title = formData.get('title') as string;
    const releaseDate = formData.get('releaseDate') as string;
    const description = formData.get('description') as string;
    const thumbnailFile = formData.get('thumbnail') as File;

    // Validate required fields
    if (!title || !releaseDate || !description || !thumbnailFile) {
      return NextResponse.json(
        { success: false, message: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate file
    if (!validateFileType(thumbnailFile)) {
      return NextResponse.json(
        { success: false, message: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.' },
        { status: 400 }
      );
    }

    if (!validateFileSize(thumbnailFile)) {
      return NextResponse.json(
        { success: false, message: 'File size exceeds 10MB limit.' },
        { status: 400 }
      );
    }

    await connectDB();

    // Generate unique slug
    const slug = await generateUniqueSlug(title);

    // Upload thumbnail to Cloudinary
    const thumbnailData = await uploadToCloudinary(thumbnailFile, 'thumbnails');

    // Create title
    const newTitle = await Title.create({
      title,
      slug,
      releaseDate,
      description,
      thumbnail: thumbnailData,
      viewCount: 0,
    });

    return NextResponse.json({
      success: true,
      data: newTitle,
      message: 'Title created successfully',
    });
  } catch (error) {
    console.error('Create title error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create title' },
      { status: 500 }
    );
  }
}