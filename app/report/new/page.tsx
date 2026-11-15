import type { Metadata } from "next";
import ReportFormClient from "@/components/report/ReportFormClient";

export const metadata: Metadata = {
  title: "Report a problem — Thambi",
  description: "Report a broken road, water leak, sewage or pollution problem in Tamil Nadu.",
};

export default function NewReportPage() {
  return <ReportFormClient />;
}
