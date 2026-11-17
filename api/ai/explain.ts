import {
  type ConsentFilteredContext,
  extractApiErrorMessage,
  runExplainCompanion,
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
      context?: ConsentFilteredContext;
    };

    if (!body.context) {
      return res.status(400).json({ error: "Missing screening context." });
    }

    const parsed = await runExplainCompanion(body.lang || "en", body.context);
    return res.status(200).json(parsed);
  } catch (err) {
    const mapped = extractApiErrorMessage(err);
    return res.status(mapped.status).json({ error: mapped.message });
  }
}
