import { Skeleton } from "@/components/ui/skeleton"

export function NavigationSkeleton() {
  return (
    <div className="relative h-[calc(100vh-4rem)]">
      <Skeleton className="h-full w-full" />
      <div className="absolute inset-x-0 top-4 z-50 flex justify-center">
        <div className="w-full max-w-md px-4">
          <Skeleton className="mb-4 h-16 w-full rounded-lg" />
          <Skeleton className="h-48 w-full rounded-lg" />
        </div>
      </div>
    </div>
  )
}




