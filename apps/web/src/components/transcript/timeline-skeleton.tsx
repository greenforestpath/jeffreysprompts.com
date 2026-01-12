"use client";

import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface TimelineSkeletonProps {
  /** Number of section groups to show */
  sections?: number;
  /** Number of message previews per section */
  messagesPerSection?: number;
}

/**
 * Loading skeleton for TranscriptTimeline.
 * Matches the structure of the actual timeline for seamless transitions.
 */
export function TimelineSkeleton({
  sections = 3,
  messagesPerSection = 3,
}: TimelineSkeletonProps) {
  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-[1.125rem] top-0 bottom-0 w-0.5 bg-gradient-to-b from-neutral-300 via-neutral-200 to-neutral-300 dark:from-neutral-700 dark:via-neutral-600 dark:to-neutral-700 opacity-30" />

      {/* Section groups */}
      <div className="space-y-4">
        {Array.from({ length: sections }).map((_, sectionIndex) => (
          <SectionSkeleton
            key={sectionIndex}
            index={sectionIndex}
            messageCount={messagesPerSection}
          />
        ))}
      </div>
    </div>
  );
}

interface SectionSkeletonProps {
  index: number;
  messageCount: number;
}

function SectionSkeleton({ index, messageCount }: SectionSkeletonProps) {
  return (
    <div className="relative">
      {/* Section header */}
      <div className="flex items-center gap-3 p-3">
        {/* Section number circle */}
        <Skeleton
          variant="pulse"
          className={cn(
            "relative z-10 w-8 h-8 rounded-full",
            "bg-neutral-200 dark:bg-neutral-700"
          )}
        />

        {/* Section info */}
        <div className="flex-1 space-y-2">
          <Skeleton
            variant="pulse"
            className="h-4 w-32 bg-neutral-200 dark:bg-neutral-700"
          />
          <Skeleton
            variant="pulse"
            className="h-3 w-48 bg-neutral-100 dark:bg-neutral-800"
          />
        </div>

        {/* Expand indicator */}
        <Skeleton
          variant="pulse"
          className="w-5 h-5 rounded bg-neutral-100 dark:bg-neutral-800"
        />
      </div>

      {/* Message previews (first section expanded) */}
      {index === 0 && (
        <div className="pl-11 space-y-2 py-2">
          {Array.from({ length: messageCount }).map((_, msgIndex) => (
            <MessagePreviewSkeleton key={msgIndex} />
          ))}
        </div>
      )}
    </div>
  );
}

function MessagePreviewSkeleton() {
  return (
    <div
      className={cn(
        "p-3 rounded-lg",
        "border-l-2 border-neutral-200 dark:border-neutral-700"
      )}
    >
      {/* Header row */}
      <div className="flex items-center gap-2 mb-2">
        <Skeleton
          variant="pulse"
          className="w-4 h-4 rounded-full bg-neutral-200 dark:bg-neutral-700"
        />
        <Skeleton
          variant="pulse"
          className="h-3 w-12 bg-neutral-200 dark:bg-neutral-700"
        />
        <Skeleton
          variant="pulse"
          className="h-3 w-10 bg-neutral-100 dark:bg-neutral-800"
        />
      </div>

      {/* Content preview */}
      <div className="space-y-1.5">
        <Skeleton
          variant="pulse"
          className="h-3 w-full bg-neutral-100 dark:bg-neutral-800"
        />
        <Skeleton
          variant="pulse"
          className="h-3 w-3/4 bg-neutral-100 dark:bg-neutral-800"
        />
      </div>
    </div>
  );
}

/**
 * Compact skeleton for inline loading states.
 */
export function TimelineSkeletonCompact() {
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton
            variant="pulse"
            className="w-6 h-6 rounded-full bg-neutral-200 dark:bg-neutral-700"
          />
          <div className="flex-1 space-y-1">
            <Skeleton
              variant="pulse"
              className="h-3 w-full bg-neutral-100 dark:bg-neutral-800"
            />
            <Skeleton
              variant="pulse"
              className="h-3 w-2/3 bg-neutral-100 dark:bg-neutral-800"
            />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Loading skeleton for StatsDashboard.
 * Shows 6 stat card placeholders in a responsive grid.
 */
export function StatsDashboardSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "relative rounded-xl p-4 border",
            "bg-neutral-50 dark:bg-neutral-900",
            "border-neutral-200 dark:border-neutral-800"
          )}
        >
          {/* Icon placeholder */}
          <Skeleton
            variant="pulse"
            className="w-10 h-10 rounded-lg mb-3 bg-neutral-200 dark:bg-neutral-700"
          />

          {/* Value */}
          <Skeleton
            variant="pulse"
            className="h-7 w-16 mb-1 bg-neutral-200 dark:bg-neutral-700"
          />

          {/* Label */}
          <Skeleton
            variant="pulse"
            className="h-4 w-20 bg-neutral-100 dark:bg-neutral-800"
          />
        </div>
      ))}
    </div>
  );
}
