import { cx } from '../../lib/format'

export function Skeleton({ className }: { className?: string }) {
  return <div className={cx('skeleton', className)} />
}

export function CardSkeleton() {
  return (
    <div className="paper rounded-3xl p-6">
      <div className="flex justify-between">
        <div className="flex-1">
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="mt-2 h-3 w-1/2" />
        </div>
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <Skeleton className="mt-6 h-12 w-full" />
      <div className="mt-6 flex items-end justify-between">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-4 w-16" />
      </div>
    </div>
  )
}

export function RowSkeleton() {
  return (
    <div className="flex items-center gap-4 border-t border-line px-4 py-4">
      <Skeleton className="h-4 w-4" />
      <Skeleton className="h-4 w-40" />
      <Skeleton className="h-4 w-24" />
      <Skeleton className="ml-auto h-4 w-12" />
      <Skeleton className="h-4 w-16" />
    </div>
  )
}
