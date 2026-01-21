import { NextResponse, type NextRequest } from "next/server";
import { isValidUsername } from "@/lib/username";
import { getPublicProfile } from "@/lib/profile/profile-store";

/**
 * GET /api/users/[username]
 *
 * Returns public profile data for a user.
 * Returns 404 if user not found or profile is private.
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ username: string }> }
) {
  const { username } = await context.params;

  // Validate username format
  if (!isValidUsername(username)) {
    return NextResponse.json(
      { error: "invalid_username", message: "Invalid username format" },
      { status: 400 }
    );
  }

  // Get public profile from store
  const publicProfile = getPublicProfile(username);

  if (!publicProfile) {
    return NextResponse.json(
      { error: "not_found", message: "User not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(publicProfile, {
    headers: {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
    },
  });
}
