interface ApiRequest {
  method?: string;
}

interface ApiResponse {
  status: (code: number) => ApiResponse;
  json: (body: unknown) => void;
  setHeader: (name: string, value: string) => void;
}

export default function handler(_req: ApiRequest, res: ApiResponse) {
  res.setHeader("Content-Type", "application/json");
  return res.status(200).json({
    ok: true,
    aiConfigured: Boolean(process.env.GEMINI_API_KEY),
  });
}
