"use server";

import { ConnectionStatus, Platform } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const createPersonaSchema = z.object({
  name: z.string().min(2).max(120),
  primaryHandle: z.string().min(2).max(80),
  avatarUrl: z.string().url().optional().or(z.literal("")),
  age: z.number().int().min(13).max(120).optional(),
  location: z.string().max(120).optional(),
  politicalStance: z.string().max(120).optional(),
  tone: z.string().max(120).optional(),
  bioMarkdown: z.string().max(20000).optional(),
  timezone: z.string().max(100).optional(),
});

const updatePersonaProfileSchema = createPersonaSchema.extend({
  personaId: z.string().cuid(),
});

const updatePersonaPositionSchema = z.object({
  personaId: z.string().cuid(),
  x: z.number().finite(),
  y: z.number().finite(),
});

const updatePersonaPlatformStyleSchema = z.object({
  personaId: z.string().cuid(),
  platform: z.nativeEnum(Platform),
  styleGuideMarkdown: z.string().max(20000),
});

const updatePersonaPlatformCredentialSchema = z.object({
  personaId: z.string().cuid(),
  platform: z.nativeEnum(Platform),
  apiKey: z.string().max(4000).optional(),
  apiSecret: z.string().max(4000).optional(),
  accessToken: z.string().max(4000).optional(),
  refreshToken: z.string().max(4000).optional(),
  connectionHint: z.string().max(1000).optional(),
});

const testPersonaPlatformConnectionSchema = z.object({
  personaId: z.string().cuid(),
  platform: z.nativeEnum(Platform),
});

export type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export async function createPersonaAction(
  input: z.infer<typeof createPersonaSchema>,
): Promise<ActionResult<{ personaId: string }>> {
  const parsed = createPersonaSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const data = parsed.data;

  const persona = await prisma.persona.create({
    data: {
      name: data.name,
      primaryHandle: data.primaryHandle,
      avatarUrl: data.avatarUrl || null,
      age: data.age,
      location: data.location,
      politicalStance: data.politicalStance,
      tone: data.tone,
      bioMarkdown: data.bioMarkdown ?? "",
      timezone: data.timezone ?? "UTC",
      platforms: {
        create: [
          { platform: Platform.LINKEDIN },
          { platform: Platform.X },
          { platform: Platform.INSTAGRAM },
          { platform: Platform.REDDIT },
        ],
      },
    },
    select: { id: true },
  });

  revalidatePath("/");

  return { ok: true, data: { personaId: persona.id } };
}

export async function updatePersonaProfileAction(
  input: z.infer<typeof updatePersonaProfileSchema>,
): Promise<ActionResult> {
  const parsed = updatePersonaProfileSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { personaId, ...data } = parsed.data;

  await prisma.persona.update({
    where: { id: personaId },
    data: {
      name: data.name,
      primaryHandle: data.primaryHandle,
      avatarUrl: data.avatarUrl || null,
      age: data.age,
      location: data.location,
      politicalStance: data.politicalStance,
      tone: data.tone,
      bioMarkdown: data.bioMarkdown ?? "",
      timezone: data.timezone ?? "UTC",
    },
  });

  revalidatePath("/");

  return { ok: true, data: undefined };
}

export async function updatePersonaPositionAction(
  input: z.infer<typeof updatePersonaPositionSchema>,
): Promise<ActionResult> {
  const parsed = updatePersonaPositionSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { personaId, x, y } = parsed.data;

  await prisma.persona.update({
    where: { id: personaId },
    data: {
      canvasX: x,
      canvasY: y,
    },
  });

  revalidatePath("/");

  return { ok: true, data: undefined };
}

export async function updatePersonaPlatformStyleAction(
  input: z.infer<typeof updatePersonaPlatformStyleSchema>,
): Promise<ActionResult> {
  const parsed = updatePersonaPlatformStyleSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { personaId, platform, styleGuideMarkdown } = parsed.data;

  await prisma.personaPlatform.upsert({
    where: {
      personaId_platform: {
        personaId,
        platform,
      },
    },
    update: {
      styleGuideMarkdown,
    },
    create: {
      personaId,
      platform,
      styleGuideMarkdown,
    },
  });

  revalidatePath("/");

  return { ok: true, data: undefined };
}

export async function updatePersonaPlatformCredentialAction(
  input: z.infer<typeof updatePersonaPlatformCredentialSchema>,
): Promise<ActionResult> {
  const parsed = updatePersonaPlatformCredentialSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { personaId, platform } = parsed.data;
  const isLinkedIn = platform === Platform.LINKEDIN;
  const apiKey = isLinkedIn ? "" : (parsed.data.apiKey ?? "").trim();
  const apiSecret = isLinkedIn ? null : parsed.data.apiSecret?.trim() || null;
  const accessToken = isLinkedIn ? null : parsed.data.accessToken?.trim() || null;
  const refreshToken = isLinkedIn ? null : parsed.data.refreshToken?.trim() || null;
  const connectionHint = parsed.data.connectionHint?.trim() || null;

  await prisma.$transaction([
    prisma.platformCredential.upsert({
      where: {
        personaId_platform: {
          personaId,
          platform,
        },
      },
      update: {
        apiKey,
        apiSecret,
        accessToken,
        refreshToken,
        connectionHint,
        lastTestStatus: ConnectionStatus.DISCONNECTED,
        lastTestedAt: null,
      },
      create: {
        personaId,
        platform,
        apiKey,
        apiSecret,
        accessToken,
        refreshToken,
        connectionHint,
        lastTestStatus: ConnectionStatus.DISCONNECTED,
      },
    }),
    prisma.personaPlatform.upsert({
      where: {
        personaId_platform: {
          personaId,
          platform,
        },
      },
      update: {
        connectionStatus: ConnectionStatus.DISCONNECTED,
        lastTestedAt: null,
      },
      create: {
        personaId,
        platform,
        connectionStatus: ConnectionStatus.DISCONNECTED,
      },
    }),
  ]);

  revalidatePath("/");

  return { ok: true, data: undefined };
}

function hasCredentialPayload(values: Array<string | null | undefined>) {
  return values.some((value) => Boolean(value && value.trim().length > 0));
}

function hasFailureHint(values: Array<string | null | undefined>) {
  return values.some((value) => {
    if (!value) {
      return false;
    }
    const normalized = value.toLowerCase();
    return normalized.includes("invalid") || normalized.includes("fail") || normalized.includes("error");
  });
}

export async function testPersonaPlatformConnectionAction(
  input: z.infer<typeof testPersonaPlatformConnectionSchema>,
): Promise<ActionResult<{ status: ConnectionStatus; testedAt: string; message: string }>> {
  const parsed = testPersonaPlatformConnectionSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { personaId, platform } = parsed.data;
  const now = new Date();

  const credential = await prisma.platformCredential.findUnique({
    where: {
      personaId_platform: {
        personaId,
        platform,
      },
    },
  });

  let status: ConnectionStatus = ConnectionStatus.DISCONNECTED;
  let message = "No saved credentials to test.";
  if (platform === Platform.LINKEDIN) {
    const hasHint = hasCredentialPayload([credential?.connectionHint]);
    const shouldFail = hasFailureHint([credential?.connectionHint]);

    if (!hasHint) {
      status = ConnectionStatus.DISCONNECTED;
      message = "Manual LinkedIn setup missing profile URL.";
    } else if (shouldFail) {
      status = ConnectionStatus.ERROR;
      message = "Manual LinkedIn setup failed validation.";
    } else {
      status = ConnectionStatus.CONNECTED;
      message = "Manual LinkedIn setup validated. Ready for approval-only posting.";
    }
  } else {
    const hasAnyCredential = hasCredentialPayload([
      credential?.apiKey,
      credential?.apiSecret,
      credential?.accessToken,
      credential?.refreshToken,
      credential?.connectionHint,
    ]);

    if (hasAnyCredential) {
      const shouldFail = hasFailureHint([
        credential?.apiKey,
        credential?.apiSecret,
        credential?.accessToken,
        credential?.refreshToken,
        credential?.connectionHint,
      ]);

      if (shouldFail) {
        status = ConnectionStatus.ERROR;
        message = "Stub test failed. Update credentials and try again.";
      } else {
        status = ConnectionStatus.CONNECTED;
        message = "Stub test passed. Platform marked as connected.";
      }
    }
  }

  await prisma.$transaction([
    prisma.personaPlatform.upsert({
      where: {
        personaId_platform: {
          personaId,
          platform,
        },
      },
      update: {
        connectionStatus: status,
        lastTestedAt: now,
      },
      create: {
        personaId,
        platform,
        connectionStatus: status,
        lastTestedAt: now,
      },
    }),
    ...(credential
      ? [
          prisma.platformCredential.update({
            where: {
              personaId_platform: {
                personaId,
                platform,
              },
            },
            data: {
              lastTestStatus: status,
              lastTestedAt: now,
            },
          }),
        ]
      : []),
  ]);

  revalidatePath("/");

  return {
    ok: true,
    data: {
      status,
      testedAt: now.toISOString(),
      message,
    },
  };
}

export async function listPersonasAction() {
  return prisma.persona.findMany({
    orderBy: { createdAt: "asc" },
    include: {
      platforms: {
        select: {
          platform: true,
          connectionStatus: true,
          lastTestedAt: true,
        },
      },
    },
  });
}
