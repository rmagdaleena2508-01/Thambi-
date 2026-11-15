import type { NextRequest } from "next/server";
import sharp from "sharp";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { understand } from "@/lib/report/analyze";
import { embed, toVector } from "@/lib/ai/gemini";

export const maxDuration = 60;

// 64-bit difference hash: catches the same photo reused across reports.
async function dHash(image: Buffer) {
  const pixels = await sharp(image).rotate().greyscale().resize(9, 8, { fit: "fill" }).raw().toBuffer();
  let bits = "";
  for (let row = 0; row < 8; row++)
    for (let col = 0; col < 8; col++) bits += pixels[row * 9 + col] > pixels[row * 9 + col + 1] ? "1" : "0";
  return BigInt("0b" + bits).toString(16).padStart(16, "0");
}

// After the citizen files a report and uploads media, the server:
// reads the words (AI + keywords), stores the meaning vector, makes clean public
// copies of photos (metadata removed), checks for reused photos, and decides
// whether the report can go live or needs a moderator first.
export async function POST(_request: NextRequest, ctx: RouteContext<"/api/reports/[id]/finalize">) {
  const { id } = await ctx.params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return Response.json({ error: "invalid_id" }, { status: 400 });

  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims?.sub;
  if (!userId) return Response.json({ error: "sign_in_required" }, { status: 401 });

  // Ownership check through the user's own session: RLS only returns their report.
  const { data: report } = await supabase
    .from("reports")
    .select("id, reporter_id, category, description, title, road_name, locality, landmark, open_since, affected_groups, citizen_severity, review_state, created_at, danger_flags, text_severity")
    .eq("id", id)
    .single();
  if (!report || report.reporter_id !== userId) return Response.json({ error: "not_found" }, { status: 404 });
  if (report.review_state !== "pending") return Response.json({ state: report.review_state });
  if (Date.now() - new Date(report.created_at).getTime() > 60 * 60 * 1000) {
    return Response.json({ error: "too_late" }, { status: 409 });
  }

  const admin = createAdminClient();
  if (!admin) return Response.json({ state: "pending", reason: "server_not_configured" }, { status: 202 });

  const input = {
    category: report.category,
    description: report.description,
    road_name: report.road_name ?? "",
    locality: report.locality ?? "",
    landmark: report.landmark ?? "",
    open_since: report.open_since,
    affected_groups: report.affected_groups ?? [],
    citizen_severity: report.citizen_severity,
  };

  const [reading, vector] = await Promise.all([
    understand(admin, input),
    embed(`${report.category}. ${report.description} ${report.road_name ?? ""} ${report.locality ?? ""}`),
  ]);

  // Photos: clean public copies, fingerprints, reuse check. Videos stay private in v1.
  const { data: media } = await admin.from("report_media").select("id, kind, path_private").eq("report_id", id);
  let reusedPhoto = false;
  for (const item of media ?? []) {
    if (item.kind !== "photo" || !item.path_private.startsWith(`${userId}/`)) continue;
    const { data: blob } = await admin.storage.from("media-private").download(item.path_private);
    if (!blob) continue;
    const original = Buffer.from(await blob.arrayBuffer());
    try {
      const clean = await sharp(original).rotate().resize(1600, 1600, { fit: "inside", withoutEnlargement: true }).webp({ quality: 78 }).toBuffer();
      const hash = await dHash(original);
      const { count } = await admin
        .from("report_media")
        .select("id", { count: "exact", head: true })
        .eq("phash", hash)
        .neq("report_id", id);
      if ((count ?? 0) > 0) reusedPhoto = true;
      const publicPath = `${id}/${item.id}.webp`;
      await admin.storage.from("media-public").upload(publicPath, clean, { contentType: "image/webp", upsert: true });
      await admin.from("report_media").update({ path_public: publicPath, phash: hash }).eq("id", item.id);
    } catch {
      // Unreadable image: leave it private; a moderator will see it.
    }
  }

  const live =
    reading.source === "ai" &&
    reading.looks_real === true &&
    (reading.confidence ?? 0) >= 0.6 &&
    !reusedPhoto;

  const reviewState = live ? "ok" : "needs_review";

  await admin
    .from("reports")
    .update({
      title: report.title || reading.title_en,
      title_ta: reading.title_ta,
      summary_en: reading.summary_en,
      summary_ta: reading.summary_ta,
      text_severity: Math.max(reading.text_severity ?? 0, report.text_severity ?? 0) || null,
      severity_reason: reading.severity_reason,
      danger_flags: Array.from(new Set([...(report.danger_flags ?? []), ...reading.danger_flags])),
      embedding: vector ? toVector(vector) : null,
      review_state: reviewState,
    })
    .eq("id", id);

  if (reusedPhoto) {
    await admin.from("flags").insert({ target_type: "report", target_id: id, reason: "A photo matches a photo in another report.", source: "rule" });
  }
  if (reading.source === "ai" && reading.looks_real === false) {
    await admin.from("flags").insert({ target_type: "report", target_id: id, reason: "AI: the description may not be a real civic problem.", source: "ai" });
  }

  return Response.json({
    state: reviewState,
    reason: live ? null : reusedPhoto ? "reused_photo" : reading.source === "keywords" ? "ai_unavailable" : "needs_check",
  });
}
