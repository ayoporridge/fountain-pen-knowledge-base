import { type NextRequest, NextResponse } from "next/server";
import { retrieveContext, buildSystemPrompt } from "@/lib/ai/chat-pipeline";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { messages } = body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: "messages array is required" }, { status: 400 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "AI not configured. Set OPENAI_API_KEY." },
      { status: 503 },
    );
  }

  // Get the latest user message for context retrieval
  const lastUserMessage = [...messages].reverse().find((m: { role: string }) => m.role === "user");
  if (!lastUserMessage) {
    return NextResponse.json({ error: "No user message found" }, { status: 400 });
  }

  // Retrieve relevant entities from knowledge graph
  const context = await retrieveContext(lastUserMessage.content);
  const systemPrompt = await buildSystemPrompt(context);

  // Call OpenAI with streaming
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages,
      ],
      temperature: 0.7,
      stream: true,
    }),
  });

  if (!res.ok) {
    return NextResponse.json({ error: `AI API error: ${res.status}` }, { status: 502 });
  }

  // Stream the response
  return new Response(res.body, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
