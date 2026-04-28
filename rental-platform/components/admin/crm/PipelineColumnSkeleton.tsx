import { SkeletonText } from "@/components/ui/SkeletonText";
import { SkeletonCard } from "@/components/ui/SkeletonCard";

export function PipelineColumnSkeleton() {
  return (
    <div className="flex-1 min-w-[300px] max-w-[350px] flex flex-col gap-3 p-3 bg-neutral-50 rounded-lg shrink-0">
      <div className="flex justify-between items-center mb-2">
        <SkeletonText className="w-1/2 h-5" />
        <div className="w-6 h-5 rounded-full bg-neutral-200 animate-pulse" />
      </div>
      <div className="flex flex-col gap-3">
        <SkeletonCard showImage={false} lines={2} />
        <SkeletonCard showImage={false} lines={2} />
        <SkeletonCard showImage={false} lines={2} />
      </div>
    </div>
  );
}
