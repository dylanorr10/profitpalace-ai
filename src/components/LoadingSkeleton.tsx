import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export const LessonSkeleton = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header skeleton */}
      <div className="border-b bg-card p-4">
        <div className="container mx-auto flex items-center justify-between">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
        {/* Title skeleton */}
        <div className="space-y-4">
          <div className="flex gap-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="flex-1 space-y-3">
              <div className="flex gap-2">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-16" />
              </div>
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-6 w-full" />
            </div>
          </div>
        </div>

        {/* Content skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-1/3" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-1/3" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export const DashboardSkeleton = () => {
  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Skeleton className="h-12 w-64" />

        {/* Cards grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export const ChatSkeleton = () => {
  return (
    <div className="p-4 space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className={`flex gap-3 ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
          {i % 2 === 1 && <Skeleton className="h-8 w-8 rounded-full shrink-0" />}
          <Card className="max-w-[75%]">
            <CardContent className="p-3 space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
          </Card>
          {i % 2 === 0 && <Skeleton className="h-8 w-8 rounded-full shrink-0" />}
        </div>
      ))}
    </div>
  );
};
