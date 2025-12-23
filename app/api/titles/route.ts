import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Title from '@/lib/models/Title';

export async function GET() {
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