import { listProviders } from "@/lib/videoEngine";

export async function GET() {
  return Response.json({ providers: listProviders() });
}
