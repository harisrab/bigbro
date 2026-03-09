import { prisma } from "@/lib/prisma";

export async function listPersonas() {
  return prisma.persona.findMany({
    orderBy: { createdAt: "asc" },
    include: {
      platforms: {
        select: {
          platform: true,
          connectionStatus: true,
          styleGuideMarkdown: true,
        },
      },
      drafts: {
        where: { status: "PENDING" },
        select: { id: true },
      },
      activityItems: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { createdAt: true },
      },
    },
  });
}
