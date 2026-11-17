import {
  type ConsentFilteredContext,
  extractApiErrorMessage,
  runChatCompanion,
} from "../../lib/aiCompanion.js";

interface ApiRequest {
  method?: string;
  body?: unknown;
}

interface ApiResponse {
  status: (code: number) => ApiResponse;
  json: (body: unknown) => void;
  setHeader: (name: string, value: string) => void;
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  res.setHeader("Content-Type", "application/json");

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        error:
          "GEMINI_API_KEY is missing on Vercel. Add it in Project Settings > Environment Variables and redeploy.",
      });
    }

    const body = (
      typeof req.body === "string" ? JSON.parse(req.body) : req.body || {}
    ) as {
      lang?: "en" | "ar";
      message?: string;
      history?: { role: "user" | "assistant"; text: string }[];
      context?: ConsentFilteredContext;
    };

    if (!body.message || !body.message.trim() || !body.context) {
      return res
        .status(400)
        .json({ error: "Message and screening context are required." });
    }

    const reply = await runChatCompanion({
      lang: body.lang || "en",
      message: body.message,
      history: body.history,
      context: body.context,
    });

    if (!reply) {
      return res
        .status(502)
        .json({ error: "Empty response received from AI Companion." });
    }

    return res.status(200).json({ reply });
  } catch (err) {
    const mapped = extractApiErrorMessage(err);
    return res.status(mapped.status).json({ error: mapped.message });
  }
}
