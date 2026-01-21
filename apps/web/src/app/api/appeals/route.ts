import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  createAppeal,
  canAppealAction,
  getUserAppeals,
  getAppeal,
  APPEAL_SUBMISSION_WINDOW_DAYS,
} from "@/lib/moderation/appeal-store";
import { getModerationAction } from "@/lib/moderation/action-store";
import { checkContentForSpam } from "@/lib/moderation/spam-check";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_EXPLANATION_LENGTH = 2000;
const MIN_EXPLANATION_LENGTH = 50;

/**
 * POST /api/appeals
 * Submit a new moderation appeal.
 *
 * Body:
 * - actionId: string - The moderation action being appealed
 * - userId: string - The user's ID
 * - userEmail: string - The user's email
 * - userName: string (optional) - The user's display name
 * - explanation: string - Why the user is appealing (50-2000 chars)
 */
export async function POST(request: NextRequest) {
  let payload: {
    actionId?: string;
    userId?: string;
    userEmail?: string;
    userName?: string;
    explanation?: string;
    company?: string; // honeypot
  };

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const actionId = payload.actionId?.trim() ?? "";
  const userId = payload.userId?.trim() ?? "";
  const userEmail = payload.userEmail?.trim().toLowerCase() ?? "";
  const userName = payload.userName?.trim() ?? "";
  const explanation = payload.explanation?.trim() ?? "";
  const honeypot = payload.company?.trim();

  // Honeypot check
  if (honeypot) {
    return NextResponse.json({ error: "Spam detected." }, { status: 400 });
  }

  // Validate required fields
  if (!actionId || !userId || !userEmail || !explanation) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  if (!EMAIL_REGEX.test(userEmail)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  if (explanation.length < MIN_EXPLANATION_LENGTH) {
    return NextResponse.json(
      { error: `Explanation must be at least ${MIN_EXPLANATION_LENGTH} characters.` },
      { status: 400 }
    );
  }

  if (explanation.length > MAX_EXPLANATION_LENGTH) {
    return NextResponse.json(
      { error: `Explanation must be ${MAX_EXPLANATION_LENGTH} characters or fewer.` },
      { status: 400 }
    );
  }

  // Verify the action exists
  const action = getModerationAction(actionId);
  if (!action) {
    return NextResponse.json({ error: "Moderation action not found." }, { status: 404 });
  }

  // Verify the user owns this action
  if (action.userId !== userId) {
    return NextResponse.json({ error: "You cannot appeal this action." }, { status: 403 });
  }

  // Check if appeal is allowed
  const appealCheck = canAppealAction(actionId, action.createdAt);
  if (!appealCheck.canAppeal) {
    return NextResponse.json(
      { error: appealCheck.reason ?? "Cannot appeal this action." },
      { status: 400 }
    );
  }

  // Check for spam
  const spamCheck = checkContentForSpam(explanation);
  if (spamCheck.isSpam) {
    return NextResponse.json(
      {
        error: "Your explanation was flagged as potential spam. Please revise and try again.",
        reasons: spamCheck.reasons,
      },
      { status: 400 }
    );
  }

  // Create the appeal
  const result = createAppeal({
    actionId,
    userId,
    userEmail,
    userName: userName || null,
    explanation,
  });

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({
    success: true,
    appeal: {
      id: result.id,
      actionId: result.actionId,
      status: result.status,
      submittedAt: result.submittedAt,
      deadlineAt: result.deadlineAt,
    },
    message: "Your appeal has been submitted and will be reviewed.",
  });
}

/**
 * GET /api/appeals
 * Get appeals for a user, or a specific appeal by ID.
 *
 * Query params:
 * - appealId: Get a specific appeal
 * - userId: Get all appeals for a user
 * - email: Required for verification
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const appealId = searchParams.get("appealId")?.trim() ?? "";
  const userId = searchParams.get("userId")?.trim() ?? "";
  const email = searchParams.get("email")?.trim().toLowerCase() ?? "";

  if (!email || !EMAIL_REGEX.test(email)) {
    return NextResponse.json({ error: "Valid email is required." }, { status: 400 });
  }

  // Get specific appeal
  if (appealId) {
    const appeal = getAppeal(appealId);
    if (!appeal || appeal.userEmail !== email) {
      return NextResponse.json({ error: "Appeal not found." }, { status: 404 });
    }

    const action = getModerationAction(appeal.actionId);

    return NextResponse.json({
      appeal: {
        id: appeal.id,
        actionId: appeal.actionId,
        status: appeal.status,
        explanation: appeal.explanation,
        submittedAt: appeal.submittedAt,
        deadlineAt: appeal.deadlineAt,
        reviewedAt: appeal.reviewedAt,
        adminResponse: appeal.adminResponse,
        action: action
          ? {
              actionType: action.actionType,
              reason: action.reason,
              details: action.details,
              createdAt: action.createdAt,
            }
          : null,
      },
    });
  }

  // Get all appeals for user
  if (!userId) {
    return NextResponse.json({ error: "userId or appealId is required." }, { status: 400 });
  }

  const appeals = getUserAppeals(userId)
    .filter((appeal) => appeal.userEmail === email)
    .map((appeal) => ({
      id: appeal.id,
      actionId: appeal.actionId,
      status: appeal.status,
      submittedAt: appeal.submittedAt,
      deadlineAt: appeal.deadlineAt,
      reviewedAt: appeal.reviewedAt,
    }));

  return NextResponse.json({ appeals });
}
