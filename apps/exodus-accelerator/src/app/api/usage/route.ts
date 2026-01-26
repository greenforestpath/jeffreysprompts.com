import { appendFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
import { NextResponse } from "next/server";

const USAGE_FILE = join(process.cwd(), "data", "usage.jsonl");

export async function POST(req: Request) {
  try {
    const { prompt_id, category } = await req.json();

    if (!prompt_id || !category) {
      return NextResponse.json(
        { error: "prompt_id and category are required" },
        { status: 400 }
      );
    }

    const event = {
      prompt_id,
      ts: Date.now(),
      category,
    };

    // Ensure data directory exists
    const dataDir = join(process.cwd(), "data");
    if (!existsSync(dataDir)) {
      mkdirSync(dataDir, { recursive: true });
    }

    // Append event to JSONL file
    appendFileSync(USAGE_FILE, JSON.stringify(event) + "\n");

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Usage tracking error:", err);
    return NextResponse.json(
      { error: "Failed to track usage" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const { readFileSync } = await import("fs");

    if (!existsSync(USAGE_FILE)) {
      return NextResponse.json([]);
    }

    const content = readFileSync(USAGE_FILE, "utf-8");
    const events = content
      .trim()
      .split("\n")
      .filter(Boolean)
      .map((line) => JSON.parse(line));

    return NextResponse.json(events);
  } catch (err) {
    console.error("Usage fetch error:", err);
    return NextResponse.json([]);
  }
}
