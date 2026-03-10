"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const draftIdSchema = z.object({
  draftId: z.string().cuid(),
});

export async function approveDraftFormAction(formData: FormData) {
  const parsed = draftIdSchema.safeParse({
    draftId: String(formData.get("draftId") ?? ""),
  });

  if (!parsed.success) {
    return;
  }

  const { draftId } = parsed.data;

  await prisma.draft.updateMany({
    where: {
      id: draftId,
      status: "PENDING",
    },
    data: {
      status: "APPROVED",
      approvedAt: new Date(),
      rejectedAt: null,
    },
  });

  revalidatePath("/");
  revalidatePath("/approval-queue");
}

export async function rejectDraftFormAction(formData: FormData) {
  const parsed = draftIdSchema.safeParse({
    draftId: String(formData.get("draftId") ?? ""),
  });

  if (!parsed.success) {
    return;
  }

  const { draftId } = parsed.data;

  await prisma.draft.updateMany({
    where: {
      id: draftId,
      status: "PENDING",
    },
    data: {
      status: "REJECTED",
      rejectedAt: new Date(),
      approvedAt: null,
    },
  });

  revalidatePath("/");
  revalidatePath("/approval-queue");
}
