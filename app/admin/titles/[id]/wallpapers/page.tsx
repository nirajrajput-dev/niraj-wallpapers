import WallpaperUpload from "@/components/admin/WallpaperUpload";
import DeleteButton from "@/components/admin/DeleteButton";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import connectDB from "@/lib/mongodb";
import Title from "@/lib/models/Title";
import Wallpaper from "@/lib/models/Wallpaper";

async function getTitleWithWallpapers(id: string) {
  try {
    await connectDB();

    // Get title
    const title = await Title.findById(id).lean();
    if (!title) return null;

    // Get wallpapers
    const wallpapers = await Wallpaper.find({ titleId: id })
      .sort({ createdAt: 1 })
      .lean();

    return {
      title: {
        ...title,
        _id: title._id.toString(),
      },
      wallpapers: wallpapers.map((w) => ({
        ...w,
        _id: w._id.toString(),
        titleId: w.titleId.toString(),
      })),
    };
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
}

export default async function ManageWallpapersPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Check authentication
  const session = await getSession();
  if (!session.isLoggedIn) {
    redirect("/admin/login");
  }

  const { id } = await params;
  const data = await getTitleWithWallpapers(id);

  if (!data) {
    notFound();
  }

  const { title, wallpapers } = data;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Link
          href="/admin/titles"
          className="text-sm text-blue-500 hover:text-blue-400 mb-4 inline-block"
        >
          ← Back to Titles
        </Link>
        <h1 className="text-3xl font-bold text-foreground">{title.title}</h1>
        <p className="text-muted mt-2">Manage wallpapers for this collection</p>
      </div>

      {/* Upload Section */}
      <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">
          Upload New Wallpapers
        </h2>
        <WallpaperUpload titleId={id} />
      </div>

      {/* Wallpapers List */}
      <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">
          Existing Wallpapers ({wallpapers.length})
        </h2>

        {wallpapers.length === 0 ? (
          <p className="text-muted text-center py-8">
            No wallpapers uploaded yet
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {wallpapers.map((wallpaper: any, index: number) => (
              <div
                key={wallpaper._id}
                className="bg-gray-800 rounded-lg overflow-hidden"
              >
                <div className="relative aspect-video">
                  <Image
                    src={wallpaper.imageUrl}
                    alt={`Wallpaper ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted">Downloads:</span>
                    <span className="text-foreground">
                      {wallpaper.downloadCount}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted">Position:</span>
                    <span className="text-foreground">#{index + 1}</span>
                  </div>
                  <DeleteButton id={wallpaper._id} type="wallpaper" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
