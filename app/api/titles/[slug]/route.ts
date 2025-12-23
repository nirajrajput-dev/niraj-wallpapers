import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Title from '@/lib/models/Title';
import Wallpaper from '@/lib/models/Wallpaper';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    await connectDB();

    const title = await Title.findOne({ slug });
    if (!title) {
      return NextResponse.json(
        { success: false, message: 'Title not found' },
        { status: 404 }
      );
    }

    const wallpapers = await Wallpaper.find({ titleId: title._id }).sort({ createdAt: 1 });

    return NextResponse.json({
      success: true,
      data: {
        title,
        wallpapers,
      },
    });
  } catch (error) {
    console.error('Fetch title error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch title' },
      { status: 500 }
    );
  }
}