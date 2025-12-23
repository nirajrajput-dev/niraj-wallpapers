export default function SkeletonCard() {
  return (
    <div className="w-full animate-pulse">
      <div className="flex flex-col lg:flex-row gap-8 items-center">
        {/* Image skeleton */}
        <div className="w-full lg:w-1/2 aspect-video bg-gray-800 rounded"></div>

        {/* Text skeleton */}
        <div className="w-full lg:w-1/2 flex flex-col gap-4 items-center lg:items-start">
          <div className="h-8 bg-gray-800 rounded w-3/4"></div>
          <div className="h-6 bg-gray-800 rounded w-1/2"></div>
        </div>
      </div>
    </div>
  );
}
