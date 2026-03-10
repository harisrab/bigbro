import { prisma } from "@/lib/prisma";

export async function listPendingDrafts() {
  return prisma.draft.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      platform: true,
      content: true,
      createdAt: true,
      persona: {
        select: {
          id: true,
          name: true,
          primaryHandle: true,
        },
      },
    },
  });
}
