import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { analyzeReport, type ReportInput } from "@/lib/ai/gemini";

export type Understanding = {
  source: "ai" | "keywords";
  title_en: string | null;
  summary_en: string | null;
  text_severity: number | null;
  severity_reason: string | null;
  danger_flags: string[];
  looks_real: boolean | null;
  confidence: number | null;
  category_matches: boolean | null;
  suggested_category: string | null;
  comment_starters: string[];
};

// One reading of a report: the database keyword layer always runs; the AI adds
// understanding when available. The keyword floor can only raise severity.
export async function understand(supabase: SupabaseClient, input: ReportInput): Promise<Understanding> {
  const [{ data: words }, ai] = await Promise.all([
    supabase.rpc("danger_words", { p_text: input.description }).single<{ flags: string[]; severity_floor: number | null }>(),
    analyzeReport(input),
  ]);

  const floor = words?.severity_floor ?? null;
  const keywordFlags = words?.flags ?? [];

  if (!ai) {
    return {
      source: "keywords",
      title_en: null, summary_en: null,
      text_severity: floor,
      severity_reason: floor ? "Danger words in the description." : null,
      danger_flags: keywordFlags,
      looks_real: null, confidence: null, category_matches: null, suggested_category: null,
      comment_starters: [],
    };
  }

  return {
    source: "ai",
    title_en: ai.title_en,
    summary_en: ai.summary_en,
    text_severity: Math.max(ai.text_severity, floor ?? 0),
    severity_reason: ai.severity_reason,
    danger_flags: Array.from(new Set([...keywordFlags, ...ai.danger_words.filter((w) => /^[a-z_]{3,30}$/.test(w))])),
    looks_real: ai.looks_like_real_civic_problem,
    confidence: ai.confidence,
    category_matches: ai.category_matches_user_choice,
    suggested_category: ai.suggested_category,
    comment_starters: ai.suggested_comment_starters,
  };
}
