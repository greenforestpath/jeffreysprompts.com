import { NextResponse, type NextRequest } from "next/server";
import {
  getFeature,
  getFeatureComments,
  hasUserVoted,
} from "@/lib/roadmap/roadmap-store";

/**
 * GET /api/roadmap/[id]
 *
 * Get a single feature request with comments.
 *
 * Query params:
 * - userId: include voting status for this user
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const feature = getFeature(id);

  if (!feature) {
    return NextResponse.json(
      { error: "not_found", message: "Feature not found" },
      { status: 404 }
    );
  }

  const comments = getFeatureComments(id);

  // Check if user has voted
  const userId = request.nextUrl.searchParams.get("userId");
  const hasVoted = userId ? hasUserVoted(id, userId) : false;

  return NextResponse.json(
    {
      feature,
      comments,
      hasVoted,
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
      },
    }
  );
}
