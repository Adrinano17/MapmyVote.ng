import { Skeleton } from "@/components/ui/skeleton"

export function MapSkeleton() {
  return (
    <div className="relative h-full">
      <Skeleton className="h-full w-full" />
      <div className="absolute inset-x-0 top-4 z-50 flex justify-center">
        <div className="w-full max-w-md px-4">
          <Skeleton className="h-64 w-full rounded-lg" />
        </div>
      </div>
    </div>
  )
}




