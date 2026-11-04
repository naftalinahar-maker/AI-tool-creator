import { startJob } from "@/lib/videoEngine";
import { clampClipSeconds } from "@/lib/types";

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "גוף הבקשה אינו JSON תקין." }, { status: 400 });
  }
  const prompt = typeof body.prompt === "string" ? body.prompt.trim().slice(0, 1500) : "";
  if (!prompt) return Response.json({ error: "חסר תיאור חזותי לסצנה." }, { status: 400 });
  const seconds = clampClipSeconds(body.seconds);
  const provider = typeof body.provider === "string" ? body.provider : undefined;
  try {
    return Response.json(await startJob(prompt, seconds, provider));
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : String(err) }, { status: 502 });
  }
}
