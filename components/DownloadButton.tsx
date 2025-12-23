"use client";

import { useState } from "react";
import toast from "react-hot-toast";

interface DownloadButtonProps {
  wallpaperId: string;
  isVisible: boolean;
}

export default function DownloadButton({
  wallpaperId,
  isVisible,
}: DownloadButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isDownloading) return;

    setIsDownloading(true);

    try {
      const response = await fetch(`/api/wallpapers/${wallpaperId}/download`, {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Download failed");
      }

      // Create temporary link and trigger download
      const link = document.createElement("a");
      link.href = data.data.originalUrl;
      link.download = data.data.filename;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Download started!");
    } catch (error: any) {
      toast.error(error.message || "Failed to download");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div
      className={`absolute inset-0 bg-black/40 backdrop-blur-sm rounded transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      <button
        onClick={handleDownload}
        disabled={isDownloading}
        className="absolute bottom-4 right-4 px-6 py-2 bg-white/20 backdrop-blur-md text-foreground rounded hover:bg-white/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isDownloading ? "Downloading..." : "Download"}
      </button>
    </div>
  );
}
