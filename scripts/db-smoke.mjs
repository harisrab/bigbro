import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const created = await prisma.persona.create({
    data: {
      name: "Smoke Test Persona",
      primaryHandle: "@smoketest",
      tone: "direct",
      location: "Local",
      platforms: {
        create: [
          { platform: "LINKEDIN" },
          { platform: "X" },
          { platform: "INSTAGRAM" },
          { platform: "REDDIT" },
        ],
      },
    },
    select: {
      id: true,
      name: true,
      platforms: { select: { platform: true } },
    },
  });

  const fetched = await prisma.persona.findUnique({
    where: { id: created.id },
    select: {
      id: true,
      name: true,
      primaryHandle: true,
      platforms: { select: { platform: true } },
    },
  });

  await prisma.persona.delete({ where: { id: created.id } });

  console.log(
    JSON.stringify(
      {
        ok: Boolean(fetched),
        personaId: created.id,
        platformCount: fetched?.platforms.length ?? 0,
      },
      null,
      2,
    ),
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
