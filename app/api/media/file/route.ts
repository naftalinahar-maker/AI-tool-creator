import type { NextRequest } from "next/server";
import { jobStatus } from "@/lib/videoEngine";

// Streams the finished media through this server so the browser gets it from the
// same origin (needed to draw it onto the canvas and record it) and so provider
// keys never reach the client. The URL is re-resolved server-side from the job,
// so this route cannot be used to fetch arbitrary URLs.
export async function GET(request: NextRequest) {
  const provider = request.nextUrl.searchParams.get("provider") ?? "";
  const job = request.nextUrl.searchParams.get("job") ?? "";
  const status = await jobStatus(provider, job);
  if (status.state !== "done") {
    return Response.json({ error: "המדיה עדיין לא מוכנה." }, { status: 409 });
  }
  let upstream: Response;
  try {
    upstream = await fetch(status.mediaUrl, { headers: status.headers, redirect: "follow" });
  } catch (err) {
    console.error("Media download failed:", err);
    return Response.json({ error: "השרת לא הצליח להתחבר לספק המדיה. בדקו חיבור לאינטרנט." }, { status: 502 });
  }
  if (!upstream.ok || !upstream.body) {
    return Response.json({ error: `הורדת המדיה נכשלה (${upstream.status}).` }, { status: 502 });
  }
  return new Response(upstream.body, {
    headers: {
      "Content-Type": upstream.headers.get("content-type") ?? (status.kind === "video" ? "video/mp4" : "image/jpeg"),
      "Cache-Control": "private, max-age=3600",
    },
  });
}
