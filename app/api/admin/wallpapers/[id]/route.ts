import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Wallpaper from '@/lib/models/Wallpaper';
import Title from '@/lib/models/Title';
import { requireAuth } from '@/lib/adminAuth';
import { deleteFromCloudinary } from '@/lib/cloudinary';

// DELETE - Delete wallpaper
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAuth();
  if (authError) return authError;

  try {
    const { id } = await params;
    await connectDB();

    const wallpaper = await Wallpaper.findById(id);
    if (!wallpaper) {
      return NextResponse.json(
        { success: false, message: 'Wallpaper not found' },
        { status: 404 }
      );
    }

    // Delete from Cloudinary
    await deleteFromCloudinary(wallpaper.publicId);

    // Delete from database
    await Wallpaper.findByIdAndDelete(id);

    // Update parent title's updatedAt
    await Title.findByIdAndUpdate(wallpaper.titleId, {
      updatedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: 'Wallpaper deleted successfully',
    });
  } catch (error) {
    console.error('Delete wallpaper error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete wallpaper' },
      { status: 500 }
    );
  }
}