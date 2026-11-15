"use client";

import dynamic from "next/dynamic";

// The form reads its saved draft from this device, so it renders in the browser only.
const ReportForm = dynamic(() => import("./ReportForm"), {
  ssr: false,
  loading: () => <div className="mx-auto h-[60vh] w-full max-w-[640px]" />,
});

export default function ReportFormClient() {
  return <ReportForm />;
}
