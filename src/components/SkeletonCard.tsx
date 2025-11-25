import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

type SkeletonCardProps = {
  variant?: 'stat' | 'record' | 'report';
  className?: string;
};

export function SkeletonCard({ variant = 'record', className = '' }: SkeletonCardProps) {
  if (variant === 'stat') {
    return (
      <Card className={`shadow-card border-border ${className}`}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <Skeleton className="h-4 w-24 mb-3" />
              <Skeleton className="h-8 w-16" />
            </div>
            <Skeleton className="h-12 w-12 rounded-xl" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (variant === 'report') {
    return (
      <Card className={`shadow-card border-border ${className}`}>
        <CardHeader className="border-b border-border/50 bg-muted/30">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Skeleton className="h-5 w-32 mb-2" />
              <Skeleton className="h-4 w-48" />
            </div>
            <Skeleton className="h-16 w-16 rounded-xl" />
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Evolution section */}
          <div>
            <Skeleton className="h-5 w-24 mb-3" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>

          {/* Insights section */}
          <div>
            <Skeleton className="h-5 w-32 mb-3" />
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="h-5 w-5 rounded-full flex-shrink-0" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ))}
            </div>
          </div>

          {/* Alerts section */}
          <div>
            <Skeleton className="h-5 w-24 mb-3" />
            <div className="space-y-2">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-16 w-full rounded-lg" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Default 'record' variant
  return (
    <Card className={`shadow-card border-border ${className}`}>
      <CardHeader className="border-b border-border/50">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-5 w-24" />
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Sleep section */}
        <div>
          <Skeleton className="h-5 w-16 mb-3" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-20 w-full rounded-lg" />
            <Skeleton className="h-20 w-full rounded-lg" />
          </div>
        </div>

        {/* Mood section */}
        <div>
          <Skeleton className="h-5 w-16 mb-3" />
          <div className="flex gap-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-10 w-20 rounded-full" />
            ))}
          </div>
        </div>

        {/* Activities section */}
        <div>
          <Skeleton className="h-5 w-24 mb-3" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>

        {/* Notes section */}
        <div>
          <Skeleton className="h-5 w-20 mb-3" />
          <Skeleton className="h-16 w-full rounded-lg" />
        </div>
      </CardContent>
    </Card>
  );
}
