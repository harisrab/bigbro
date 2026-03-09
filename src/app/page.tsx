import { CampaignCanvasShell } from "@/components/canvas/campaign-canvas-shell";
import { listPersonas } from "@/lib/data/personas";

export default async function Home() {
  const personas = await listPersonas();

  const initialPersonas = personas.map((persona) => ({
    id: persona.id,
    name: persona.name,
    primaryHandle: persona.primaryHandle,
    avatarUrl: persona.avatarUrl,
    age: persona.age,
    location: persona.location,
    politicalStance: persona.politicalStance,
    tone: persona.tone,
    bioMarkdown: persona.bioMarkdown,
    canvasX: persona.canvasX,
    canvasY: persona.canvasY,
    pendingDrafts: persona.drafts.length,
    platforms: persona.platforms.map((platform) => ({
      platform: platform.platform,
      connectionStatus: platform.connectionStatus,
    })),
  }));

  return <CampaignCanvasShell initialPersonas={initialPersonas} />;
}
