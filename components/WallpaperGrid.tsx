"use client";

import { useState } from "react";
import Image from "next/image";
import DownloadButton from "./DownloadButton";
import { IWallpaper } from "@/types";

interface WallpaperGridProps {
  wallpapers: IWallpaper[];
}

export default function WallpaperGrid({ wallpapers }: WallpaperGridProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-8">
      {wallpapers.map((wallpaper) => (
        <div
          key={wallpaper._id}
          className="relative w-full aspect-video"
          onMouseEnter={() => setHoveredId(wallpaper._id!)}
          onMouseLeave={() => setHoveredId(null)}
        >
          <Image
            src={wallpaper.imageUrl}
            alt="Wallpaper"
            fill
            className="object-cover rounded"
            sizes="(max-width: 1024px) 100vw, 1024px"
          />
          <DownloadButton
            wallpaperId={wallpaper._id!}
            isVisible={hoveredId === wallpaper._id}
          />
        </div>
      ))}
    </div>
  );
}
