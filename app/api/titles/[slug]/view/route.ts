import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Title from '@/lib/models/Title';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    await connectDB();

    const title = await Title.findOneAndUpdate(
      { slug },
      { $inc: { viewCount: 1 } },
      { new: true }
    );

    if (!title) {
      return NextResponse.json(
        { success: false, message: 'Title not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('View count error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update view count' },
      { status: 500 }
    );
  }
}