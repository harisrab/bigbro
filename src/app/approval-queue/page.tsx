import { Check, PencilLine, X } from "lucide-react";
import Link from "next/link";
import { approveDraftFormAction, rejectDraftFormAction } from "@/lib/actions/drafts";
import { listPendingDrafts } from "@/lib/data/drafts";
import { CyberCard } from "@/components/ui/cyber-card";
import { Button } from "@/components/ui/button";
import { PageHeading } from "@/components/ui/page-heading";

const PLATFORM_LABELS = {
  LINKEDIN: "LinkedIn",
  X: "X",
  INSTAGRAM: "Instagram",
  REDDIT: "Reddit",
} as const;

export default async function ApprovalQueuePage() {
  const pendingDrafts = await listPendingDrafts();

  return (
    <div className="content-page">
      <div className="mb-4">
        <Button asChild variant="outline">
          <Link href="/">Back To Canvas</Link>
        </Button>
      </div>
      <PageHeading
        title="Approval Queue"
        subtitle="Every draft requires your explicit decision before anything is published."
        right={
          <Button variant="outline" className="pointer-events-none">
            {pendingDrafts.length} Pending
          </Button>
        }
      />

      {pendingDrafts.length === 0 ? (
        <CyberCard>
          <p className="text-sm text-black/70">
            No pending drafts right now. Generate content from the canvas and it will appear here
            for approval.
          </p>
        </CyberCard>
      ) : null}

      <div className="grid gap-3">
        {pendingDrafts.map((draft) => (
          <CyberCard key={draft.id}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-black/90">
                  {draft.persona.name} ({draft.persona.primaryHandle}) ·{" "}
                  {PLATFORM_LABELS[draft.platform]}
                </p>
                <p className="mt-2 text-sm text-black/70">{draft.content}</p>
                <p className="mt-1 text-xs text-black/50">
                  Drafted on {draft.createdAt.toLocaleString()}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <form action={approveDraftFormAction}>
                  <input type="hidden" name="draftId" value={draft.id} />
                  <Button type="submit">
                    <Check size={15} />
                    Approve
                  </Button>
                </form>
                <Button variant="outline" disabled>
                  <PencilLine size={15} />
                  Edit
                </Button>
                <form action={rejectDraftFormAction}>
                  <input type="hidden" name="draftId" value={draft.id} />
                  <Button type="submit" variant="outline">
                    <X size={15} />
                    Reject
                  </Button>
                </form>
              </div>
            </div>
          </CyberCard>
        ))}
      </div>
    </div>
  );
}
