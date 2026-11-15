import { createClient } from "@/lib/supabase/server";
import { ReportInputSchema } from "@/lib/report/schema";
import { understand } from "@/lib/report/analyze";

// Preview for the confirm screen: what Thambi understood from the citizen's words.
// Signed-in only, to protect the AI quota. Nothing is saved here.
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  if (!claims?.claims?.sub) return Response.json({ error: "sign_in_required" }, { status: 401 });

  const parsed = ReportInputSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "invalid_input" }, { status: 400 });

  const result = await understand(supabase, parsed.data);
  return Response.json(result);
}
