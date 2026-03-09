"use server";

import { Platform } from "@prisma/client";
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
