import { z } from "zod";
import { AFFECTED, CATEGORIES, OPEN_SINCE } from "./options";

const category = z.enum(CATEGORIES.map((c) => c.value) as [string, ...string[]]);
const openSince = z.enum(OPEN_SINCE.map((o) => o.value) as [string, ...string[]]);
const affected = z.enum(AFFECTED.map((a) => a.value) as [string, ...string[]]);
const shortText = (max: number) => z.string().trim().max(max).optional().default("");

export const ReportInputSchema = z.object({
  category,
  description: z.string().trim().min(10).max(2000),
  road_name: shortText(120),
  locality: shortText(120),
  landmark: shortText(120),
  open_since: openSince,
  affected_groups: z.array(affected).max(6).default([]),
  citizen_severity: z.number().int().min(1).max(5),
});

export const SimilarInputSchema = z.object({
  category,
  text: z.string().trim().max(2000),
  lat: z.number().min(7.5).max(14.5), // Tamil Nadu bounds, with margin
  lng: z.number().min(75.5).max(81),
});
