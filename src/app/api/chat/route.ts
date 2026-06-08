import { NextResponse } from "next/server";
import { z } from "zod";

import { env, hasOpenAIEnv, hasSupabaseEnv } from "@/lib/env";
import { getOpenAI } from "@/lib/openai";
import {
  buildStudentSessionContext,
  formatStudentContextForPrompt,
} from "@/lib/student-context";
import { createClient } from "@/lib/supabase/server";

const requestSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(["user", "assistant"]),
      content: z.string().min(1).max(4000),
    }),
  ),
});

export async function POST(request: Request) {
  if (!hasOpenAIEnv()) {
    return NextResponse.json(
      { message: "OPENAI_API_KEY is not configured." },
      { status: 200 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid chat payload." }, { status: 400 });
  }

  let context = "";

  if (hasSupabaseEnv()) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    context = formatStudentContextForPrompt(
      await buildStudentSessionContext(supabase, user.id),
    );
  }

  const latestUserText = parsed.data.messages
    .slice(-8)
    .map((message) => `${message.role}: ${message.content}`)
    .join("\n");

  try {
    const openai = getOpenAI();
    const response = await openai.responses.create({
      model: env.openaiModel,
      input: [
        {
          role: "system",
          content:
            "You are Cultvr, a concise college counseling assistant for high school students. Personalize responses from the saved student context. Help students reflect, identify concrete achievements, shape goals, and define next tasks. Avoid inventing credentials, outcomes, or personal traits. Ask one useful follow-up when needed. Keep answers structured and under 180 words.",
        },
        {
          role: "user",
          content: `Student context:\n${context || "No saved context yet."}\n\nConversation:\n${latestUserText}`,
        },
      ],
    });

    return NextResponse.json({
      message: response.output_text,
    });
  } catch (error) {
    console.error("[api/chat] OpenAI request failed", error);
    return NextResponse.json(
      { error: "The assistant is temporarily unavailable. Please try again." },
      { status: 502 },
    );
  }
}
