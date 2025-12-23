import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Wallpaper from '@/lib/models/Wallpaper';
import Title from '@/lib/models/Title';
import { checkRateLimit } from '@/lib/rateLimit';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get IP address for rate limiting
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown';

    // Rate limiting
    const rateLimitResult = await checkRateLimit(ip, 'download');

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: `Download limit exceeded. Try again in ${Math.ceil(rateLimitResult.retryAfter! / 60)} minutes.`,
        },
        { status: 429, headers: { 'Retry-After': rateLimitResult.retryAfter!.toString() } }
      );
    }

    await connectDB();

    const wallpaper = await Wallpaper.findById(id);
    if (!wallpaper) {
      return NextResponse.json(
        { success: false, message: 'Wallpaper not found' },
        { status: 404 }
      );
    }

    // Increment download count
    wallpaper.downloadCount += 1;
    await wallpaper.save();

    // Get title for filename
    const title = await Title.findById(wallpaper.titleId);
    const titleSlug = title?.slug || 'wallpaper';

    // Get wallpaper index
    const wallpapers = await Wallpaper.find({ titleId: wallpaper.titleId }).sort({ createdAt: 1 });
    const index = wallpapers.findIndex((w) => w._id.toString() === id) + 1;

    const filename = `${titleSlug}-wallpaper-${index}.jpg`;

    return NextResponse.json({
      success: true,
      data: {
        originalUrl: wallpaper.originalUrl,
        filename,
      },
    });
  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to process download' },
      { status: 500 }
    );
  }
}