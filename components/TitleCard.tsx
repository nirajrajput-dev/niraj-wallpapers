"use client";

import Image from "next/image";
import Link from "next/link";
import { ITitle } from "@/types";

interface TitleCardProps {
  title: ITitle;
  index: number;
}

export default function TitleCard({ title, index }: TitleCardProps) {
  const isEven = index % 2 === 0;

  return (
    <Link href={`/${title.slug}`} className="block w-full">
      <div
        className={`flex flex-col ${
          isEven ? "lg:flex-row-reverse" : "lg:flex-row"
        } gap-8 items-center hover:opacity-90 transition-opacity`}
      >
        {/* Image Side */}
        <div className="w-full lg:w-1/2 relative aspect-video">
          <Image
            src={title.thumbnail.url}
            alt={title.title}
            fill
            className="object-cover rounded"
            sizes="(max-width: 1024px) 100vw, 512px"
            priority={index === 0}
          />
        </div>

        {/* Text Side */}
        <div className="w-full lg:w-1/2 flex flex-col gap-3 items-center lg:items-start text-center lg:text-left">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
            {title.title}
          </h2>
          <p className="text-lg lg:text-xl text-muted">{title.releaseDate}</p>
        </div>
      </div>
    </Link>
  );
}
