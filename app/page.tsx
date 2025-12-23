import Container from "@/components/Container";
import TitleCard from "@/components/TitleCard";
import SkeletonCard from "@/components/SkeletonCard";
import { ITitle } from "@/types";
import { Suspense } from "react";

async function getTitles(): Promise<ITitle[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const response = await fetch(`${baseUrl}/api/titles`, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch titles");
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error("Error fetching titles:", error);
    return [];
  }
}

async function TitlesGrid() {
  const titles = await getTitles();

  if (titles.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-muted text-xl">No wallpapers available yet.</p>
        <p className="text-muted text-sm mt-2">
          Check back soon for new additions!
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-16">
      {titles.map((title, index) => (
        <TitleCard key={title._id} title={title} index={index} />
      ))}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="flex flex-col gap-16">
      {[1, 2, 3].map((i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export default function HomePage() {
  return (
    <main className="min-h-screen py-16">
      <Container>
        {/* Header */}
        <div className="mb-16">
          <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Niraj Wallpapers
          </h1>
          <p className="text-lg lg:text-xl text-foreground max-w-3xl">
            Explore stunning wallpapers, grouped by their titles for easy
            browsing. Click any image to view its full gallery and dive into the
            artistry of your favorite titles.
          </p>
        </div>

        {/* Titles Grid */}
        <Suspense fallback={<LoadingSkeleton />}>
          <TitlesGrid />
        </Suspense>
      </Container>
    </main>
  );
}
