import { NextResponse, type NextRequest } from "next/server";

export interface WebVitalPayload {
  name: "CLS" | "FCP" | "INP" | "LCP" | "TTFB";
  value: number;
  rating: "good" | "needs-improvement" | "poor";
  delta: number;
  id: string;
  navigationType: string;
}

const VALID_METRIC_NAMES = ["CLS", "FCP", "INP", "LCP", "TTFB"] as const;
const VALID_RATINGS = ["good", "needs-improvement", "poor"] as const;

function isValidMetricName(name: unknown): name is WebVitalPayload["name"] {
  return typeof name === "string" && VALID_METRIC_NAMES.includes(name as WebVitalPayload["name"]);
}

function isValidRating(rating: unknown): rating is WebVitalPayload["rating"] {
  return typeof rating === "string" && VALID_RATINGS.includes(rating as WebVitalPayload["rating"]);
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();

    // Validate required fields
    if (!isValidMetricName(body.name)) {
      return NextResponse.json({ error: "Invalid metric name" }, { status: 400 });
    }

    if (typeof body.value !== "number" || Number.isNaN(body.value)) {
      return NextResponse.json({ error: "Invalid metric value" }, { status: 400 });
    }

    if (!isValidRating(body.rating)) {
      return NextResponse.json({ error: "Invalid rating" }, { status: 400 });
    }

    // Construct validated payload
    const payload: WebVitalPayload = {
      name: body.name,
      value: body.value,
      rating: body.rating,
      delta: typeof body.delta === "number" ? body.delta : 0,
      id: typeof body.id === "string" ? body.id : "",
      navigationType: typeof body.navigationType === "string" ? body.navigationType : "unknown",
    };

    // Log to stdout for Vercel's log drain integration
    // In production, this can be piped to Datadog, Logtail, or other services
    console.log(JSON.stringify({
      type: "web_vital",
      timestamp: new Date().toISOString(),
      ...payload,
    }));

    return NextResponse.json({ success: true }, { status: 202 });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}

// Health check for the vitals endpoint
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    status: "healthy",
    metrics: VALID_METRIC_NAMES,
  });
}
