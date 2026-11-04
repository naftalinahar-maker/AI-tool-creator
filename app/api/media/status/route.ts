import type { NextRequest } from "next/server";
import { jobStatus } from "@/lib/videoEngine";

export async function GET(request: NextRequest) {
  const provider = request.nextUrl.searchParams.get("provider") ?? "";
  const job = request.nextUrl.searchParams.get("job") ?? "";
  const status = await jobStatus(provider, job);
  // Never expose provider URLs or auth headers; the client downloads via /api/media/file.
  if (status.state === "done") return Response.json({ state: "done", kind: status.kind });
  return Response.json(status);
}
