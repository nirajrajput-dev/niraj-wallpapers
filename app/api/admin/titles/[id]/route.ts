import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Title from '@/lib/models/Title';
import Wallpaper from '@/lib/models/Wallpaper';
import { requireAuth } from '@/lib/adminAuth';
import { uploadToCloudinary, deleteFromCloudinary } from '@/lib/cloudinary';
import { validateFileType, validateFileSize } from '@/lib/utils';

// PUT - Update title
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAuth();
  if (authError) return authError;

  try {
    const { id } = await params;
    const formData = await request.formData();
    const title = formData.get('title') as string;
    const releaseDate = formData.get('releaseDate') as string;
    const description = formData.get('description') as string;
    const thumbnailFile = formData.get('thumbnail') as File | null;

    await connectDB();

    const existingTitle = await Title.findById(id);
    if (!existingTitle) {
      return NextResponse.json(
        { success: false, message: 'Title not found' },
        { status: 404 }
      );
    }

    // Update fields
    if (title) existingTitle.title = title;
    if (releaseDate) existingTitle.releaseDate = releaseDate;
    if (description) existingTitle.description = description;

    // Handle thumbnail replacement
    if (thumbnailFile && thumbnailFile.size > 0) {
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

      // Delete old thumbnail from Cloudinary
      await deleteFromCloudinary(existingTitle.thumbnail.publicId);

      // Upload new thumbnail
      const thumbnailData = await uploadToCloudinary(thumbnailFile, 'thumbnails');
      existingTitle.thumbnail = thumbnailData;
    }

    await existingTitle.save();

    return NextResponse.json({
      success: true,
      data: existingTitle,
      message: 'Title updated successfully',
    });
  } catch (error) {
    console.error('Update title error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update title' },
      { status: 500 }
    );
  }
}

// DELETE - Delete title and cascade delete wallpapers
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAuth();
  if (authError) return authError;

  try {
    const { id } = await params;
    await connectDB();

    const title = await Title.findById(id);
    if (!title) {
      return NextResponse.json(
        { success: false, message: 'Title not found' },
        { status: 404 }
      );
    }

    // Delete thumbnail from Cloudinary
    await deleteFromCloudinary(title.thumbnail.publicId);

    // Find and delete all wallpapers
    const wallpapers = await Wallpaper.find({ titleId: id });
    for (const wallpaper of wallpapers) {
      await deleteFromCloudinary(wallpaper.publicId);
    }
    await Wallpaper.deleteMany({ titleId: id });

    // Delete title
    await Title.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'Title and associated wallpapers deleted successfully',
    });
  } catch (error) {
    console.error('Delete title error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete title' },
      { status: 500 }
    );
  }
}