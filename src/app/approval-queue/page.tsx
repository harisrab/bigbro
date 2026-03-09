import { Check, PencilLine, X } from "lucide-react";
import Link from "next/link";
import { CyberCard } from "@/components/ui/cyber-card";
import { PageHeading } from "@/components/ui/page-heading";

const MOCK_ITEMS = [
  {
    persona: "Atlas Hume",
    platform: "LinkedIn",
    preview: "Leading with conviction means saying no to easy wins.",
  },
  {
    persona: "Mira Vale",
    platform: "X",
    preview: "Most founders aren't stuck. They are avoiding one difficult call.",
  },
  {
    persona: "Noor Arc",
    platform: "Reddit",
    preview: "If your launch plan has no narrative spine, expect flat engagement.",
  },
];

export default function ApprovalQueuePage() {
  return (
    <div className="content-page">
      <div className="mb-4">
        <Link className="ghost-btn" href="/">
          Back To Canvas
        </Link>
      </div>
      <PageHeading
        title="Approval Queue"
        subtitle="Every draft requires your explicit decision before anything is published."
        right={<span className="status-chip">{MOCK_ITEMS.length} Pending</span>}
      />

      <div className="grid gap-3">
        {MOCK_ITEMS.map((item) => (
          <CyberCard key={`${item.persona}-${item.platform}`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-black/90">
                  {item.persona} · {item.platform}
                </p>
                <p className="mt-2 text-sm text-black/70">{item.preview}</p>
              </div>

              <div className="flex items-center gap-2">
                <button className="primary-btn">
                  <Check size={15} />
                  Approve
                </button>
                <button className="ghost-btn">
                  <PencilLine size={15} />
                  Edit
                </button>
                <button className="ghost-btn">
                  <X size={15} />
                  Reject
                </button>
              </div>
            </div>
          </CyberCard>
        ))}
      </div>
    </div>
  );
}
