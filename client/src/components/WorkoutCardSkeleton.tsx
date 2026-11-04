import { Skeleton } from "@/components/ui/skeleton";

export function WorkoutCardSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-card shadow-lg flex flex-col p-6 space-y-4">
      {/* emoji placeholder */}
      <Skeleton className="absolute top-4 right-4 w-10 h-10 rounded-lg" />

      {/* difficulty + equipment row */}
      <div className="flex items-center gap-2 pr-12">
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>

      {/* title */}
      <Skeleton className="h-6 w-3/4 rounded-lg" />

      {/* description */}
      <div className="space-y-2 flex-1">
        <Skeleton className="h-4 w-full rounded" />
        <Skeleton className="h-4 w-5/6 rounded" />
      </div>

      {/* meta row */}
      <div className="flex items-center gap-4">
        <Skeleton className="h-4 w-16 rounded" />
        <Skeleton className="h-4 w-20 rounded" />
      </div>

      {/* CTA button */}
      <Skeleton className="h-10 w-full rounded-lg" />
    </div>
  );
}

export function WorkoutGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }, (_, i) => (
        <WorkoutCardSkeleton key={i} />
      ))}
    </div>
  );
}
