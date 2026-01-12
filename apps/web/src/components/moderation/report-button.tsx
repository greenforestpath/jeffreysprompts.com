"use client";

import { ReportDialog, type ReportDialogProps } from "@/components/reporting/ReportDialog";

export function ReportButton(props: ReportDialogProps) {
  return <ReportDialog {...props} />;
}
