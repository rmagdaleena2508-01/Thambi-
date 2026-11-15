// Status and severity visuals: colour, icon and word always together.
// Colours match design/UI_UX_PROMPT.md. Contrast checked (WCAG AA) per pair.
import type { Icon } from "@phosphor-icons/react";
import { Circle, SealCheck, PaperPlaneTilt, Clock, CheckCircle, ArrowCounterClockwise, Smiley, SmileyMeh, Car, FirstAid, Siren } from "@phosphor-icons/react/dist/ssr";

export type StatusKey = "reported" | "verified" | "sent" | "in_progress" | "fixed" | "reopened";
export const STATUS: Record<StatusKey, { word: string; chip: string; icon: Icon }> = {
  reported: { word: "Reported", chip: "chip-reported", icon: Circle },
  verified: { word: "Verified", chip: "chip-verified", icon: SealCheck },
  sent: { word: "Sent to office", chip: "chip-sent", icon: PaperPlaneTilt },
  in_progress: { word: "In progress", chip: "chip-progress", icon: Clock },
  fixed: { word: "Fixed", chip: "chip-fixed", icon: CheckCircle },
  reopened: { word: "Reopened", chip: "chip-reopened", icon: ArrowCounterClockwise },
};

export const SEVERITY_VISUAL: Record<1 | 2 | 3 | 4 | 5, { word: string; chip: string; icon: Icon }> = {
  1: { word: "Annoying", chip: "sev-1", icon: Smiley },
  2: { word: "Slows people down", chip: "sev-2", icon: SmileyMeh },
  3: { word: "Damages vehicles", chip: "sev-3", icon: Car },
  4: { word: "People could get hurt", chip: "sev-4", icon: FirstAid },
  5: { word: "Danger right now", chip: "sev-5", icon: Siren },
};
