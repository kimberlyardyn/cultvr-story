import { NextResponse } from "next/server";

import { env, hasOpenAIEnv, hasSupabaseEnv } from "@/lib/env";
import {
  checkRateLimit,
  clientIdentifier,
  tooManyRequests,
  voiceRatelimit,
} from "@/lib/ratelimit";
import { createClient } from "@/lib/supabase/server";

/**
 * Mints an ephemeral OpenAI Realtime token specifically for the activity-entry
 * voice coach. The actual instructions and tool definitions are sent from the
 * client via `session.update` once the data channel is open, so this endpoint
 * stays minimal.
 */
export async function POST(request: Request) {
  if (!hasOpenAIEnv()) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY is not configured." },
      { status: 500 },
    );
  }

  // Require an authenticated user so this paid OpenAI endpoint can't be called
  // anonymously. Mirrors the guard on /api/chat and /api/realtime-token.
  let userId: string | null = null;
  if (hasSupabaseEnv()) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    userId = user.id;
  }

  const limit = await checkRateLimit(
    voiceRatelimit,
    clientIdentifier(request, userId),
  );
  if (limit && !limit.success) {
    return tooManyRequests(limit);
  }

  try {
    const response = await fetch(
      "https://api.openai.com/v1/realtime/client_secrets",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.openaiApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          session: {
            type: "realtime",
            model: env.openaiRealtimeModel,
            audio: { output: { voice: "alloy" } },
            instructions:
              "You are Cultvr's activity intake coach. Help a high school student quickly capture details about one extracurricular activity for college applications.",
          },
        }),
      },
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: await response.text() },
        { status: response.status },
      );
    }

    return NextResponse.json(await response.json());
  } catch (error) {
    console.error("[api/activity-voice-token] OpenAI request failed", error);
    return NextResponse.json(
      { error: "Could not start a voice session. Please try again." },
      { status: 502 },
    );
  }
}
