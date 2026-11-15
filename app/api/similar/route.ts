import { createClient } from "@/lib/supabase/server";
import { SimilarInputSchema } from "@/lib/report/schema";
import { embed, toVector } from "@/lib/ai/gemini";

// The pop-out agent: are there open reports like this one nearby?
// Meaning search when the AI is available, plain "same kind, very close" otherwise.
// Only approved public reports are ever returned (row-level security).
export async function POST(request: Request) {
  const parsed = SimilarInputSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ matches: [] }, { status: 400 });
  const { category, text, lat, lng } = parsed.data;

  const supabase = await createClient();
  const vector = await embed(text);

  const { data, error } = vector
    ? await supabase.rpc("similar_reports", {
        p_lng: lng, p_lat: lat, p_category: category, p_embedding: toVector(vector),
        p_radius_m: 250, p_min_similarity: 0.75,
      })
    : await supabase.rpc("nearby_reports", { p_lng: lng, p_lat: lat, p_category: category, p_radius_m: 150 });

  if (error) return Response.json({ matches: [], mode: vector ? "meaning" : "nearby" });
  return Response.json({ matches: data ?? [], mode: vector ? "meaning" : "nearby" });
}
