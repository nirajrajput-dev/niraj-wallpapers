import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Title from '@/lib/models/Title';
import Wallpaper from '@/lib/models/Wallpaper';
import { requireAuth } from '@/lib/adminAuth';

export async function GET() {
  const authError = await requireAuth();
  if (authError) return authError;

  try {
    await connectDB();

    // Get counts
    const totalTitles = await Title.countDocuments();
    const totalWallpapers = await Wallpaper.countDocuments();

    // Get total views
    const viewsResult = await Title.aggregate([
      { $group: { _id: null, total: { $sum: '$viewCount' } } },
    ]);
    const totalViews = viewsResult.length > 0 ? viewsResult[0].total : 0;

    // Get total downloads
    const downloadsResult = await Wallpaper.aggregate([
      { $group: { _id: null, total: { $sum: '$downloadCount' } } },
    ]);
    const totalDownloads = downloadsResult.length > 0 ? downloadsResult[0].total : 0;

    // Get recent titles
    const recentTitles = await Title.find()
      .sort({ updatedAt: -1 })
      .limit(10)
      .select('title slug updatedAt');

    return NextResponse.json({
      success: true,
      data: {
        totalTitles,
        totalWallpapers,
        totalViews,
        totalDownloads,
        recentTitles,
      },
    });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}