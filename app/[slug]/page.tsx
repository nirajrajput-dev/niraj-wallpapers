import Container from "@/components/Container";
import SkeletonWallpaper from "@/components/SkeletonWallpaper";
import Link from "next/link";
import WallpaperGrid from "@/components/WallpaperGrid";
import { ITitle, IWallpaper } from "@/types";
import { notFound } from "next/navigation";
import { Suspense } from "react";

async function getTitleData(slug: string): Promise<{
  title: ITitle;
  wallpapers: IWallpaper[];
} | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const response = await fetch(`${baseUrl}/api/titles/${slug}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching title data:", error);
    return null;
  }
}

async function trackPageView(slug: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    await fetch(`${baseUrl}/api/titles/${slug}/view`, {
      method: "POST",
      cache: "no-store",
    });
  } catch (error) {
    console.error("Error tracking page view:", error);
  }
}

async function WallpapersContent({ slug }: { slug: string }) {
  const data = await getTitleData(slug);

  if (!data) {
    notFound();
  }

  // Track page view (fire and forget)
  trackPageView(slug);

  const { title, wallpapers } = data;

  return (
    <>
      {/* Header */}
      <div className="mb-12">
        <Link
          href="/"
          className="inline-block text-muted hover:text-foreground transition-colors mb-6"
        >
          Home
        </Link>
        <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">
          {title.title}
        </h1>
        <p className="text-lg lg:text-xl text-foreground">
          {title.description}
        </p>
      </div>

      {/* Wallpapers Grid */}
      {wallpapers.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-muted text-xl">No wallpapers available yet.</p>
        </div>
      ) : (
        <WallpaperGrid wallpapers={wallpapers} />
      )}
    </>
  );
}

function LoadingSkeleton() {
  return (
    <>
      <div className="mb-12 animate-pulse">
        <div className="h-6 bg-gray-800 rounded w-20 mb-6"></div>
        <div className="h-12 bg-gray-800 rounded w-3/4 mb-4"></div>
        <div className="h-6 bg-gray-800 rounded w-full"></div>
      </div>
      <div className="flex flex-col gap-8">
        {[1, 2, 3].map((i) => (
          <SkeletonWallpaper key={i} />
        ))}
      </div>
    </>
  );
}

export default async function WallpapersPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <main className="min-h-screen py-16">
      <Container>
        <Suspense fallback={<LoadingSkeleton />}>
          <WallpapersContent slug={slug} />
        </Suspense>
      </Container>
    </main>
  );
}
