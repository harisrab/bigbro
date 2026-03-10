"use client";

import Link from "next/link";
import {
  Bell,
  ChevronLeft,
  ChevronRight,
  Megaphone,
  Plus,
  Radar,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import {
  Background,
  ReactFlow,
  type Node,
  type NodeTypes,
  type NodeProps,
  type ReactFlowInstance,
  useNodesState,
} from "reactflow";
import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  createPersonaAction,
  testPersonaPlatformConnectionAction,
  updatePersonaPlatformCredentialAction,
  updatePersonaPlatformStyleAction,
  updatePersonaPositionAction,
  updatePersonaProfileAction,
} from "@/lib/actions/personas";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import "reactflow/dist/style.css";

type PlatformName = "LINKEDIN" | "X" | "INSTAGRAM" | "REDDIT";
type ConnectionStatus = "DISCONNECTED" | "CONNECTED" | "ERROR";

type CanvasPersona = {
  id: string;
  name: string;
  primaryHandle: string;
  avatarUrl: string | null;
  age: number | null;
  location: string | null;
  politicalStance: string | null;
  tone: string | null;
  bioMarkdown: string;
  canvasX: number;
  canvasY: number;
  pendingDrafts: number;
  platforms: Array<{
    platform: PlatformName;
    connectionStatus: ConnectionStatus;
    styleGuideMarkdown: string;
    lastTestedAt: string | null;
    credential: {
      apiKey: string;
      apiSecret: string | null;
      accessToken: string | null;
      refreshToken: string | null;
      connectionHint: string | null;
    } | null;
  }>;
};

type PersonaNodeData = {
  persona: CanvasPersona;
};

type ProfileDraft = {
  name: string;
  primaryHandle: string;
  age: string;
  location: string;
  politicalStance: string;
  tone: string;
  bioMarkdown: string;
  timezone: string;
};

type PlatformCredentialDraft = {
  apiKey: string;
  apiSecret: string;
  accessToken: string;
  refreshToken: string;
  connectionHint: string;
};

const PLATFORM_LABELS: Record<PlatformName, string> = {
  LINKEDIN: "in",
  X: "x",
  INSTAGRAM: "ig",
  REDDIT: "rd",
};
const PLATFORM_NAMES: Record<PlatformName, string> = {
  LINKEDIN: "LinkedIn",
  X: "X",
  INSTAGRAM: "Instagram",
  REDDIT: "Reddit",
};
const STATUS_LABELS: Record<ConnectionStatus, string> = {
  CONNECTED: "Active",
  DISCONNECTED: "Offline",
  ERROR: "Issue",
};

type Narrative = {
  id: string;
  title: string;
  description: string;
  status: "active" | "draft";
  personaSettings: NarrativePersonaSettings[];
};

type NarrativePersonaSettings = {
  personaId: string;
  postCaps: Record<PlatformName, number>;
};

type NarrativeFormDraft = {
  title: string;
  description: string;
};

const DEFAULT_PERSONA_POST_CAPS: Record<PlatformName, number> = {
  LINKEDIN: 0,
  X: 0,
  INSTAGRAM: 0,
  REDDIT: 0,
};

const PLATFORM_LIST: PlatformName[] = ["LINKEDIN", "X", "INSTAGRAM", "REDDIT"];
const PLATFORM_CREDENTIAL_BLANK: PlatformCredentialDraft = {
  apiKey: "",
  apiSecret: "",
  accessToken: "",
  refreshToken: "",
  connectionHint: "",
};

function buildNarrativePostCaps(): Record<PlatformName, number> {
  return { ...DEFAULT_PERSONA_POST_CAPS };
}

function countScheduledPosts(settings: NarrativePersonaSettings[]) {
  return settings.reduce(
    (total, setting) => total + PLATFORM_LIST.reduce((sum, platform) => sum + (setting.postCaps[platform] ?? 0), 0),
    0,
  );
}

function canActivateNarrative(narrative: Narrative) {
  return narrative.personaSettings.length > 0 && countScheduledPosts(narrative.personaSettings) > 0;
}

function buildNodes(personas: CanvasPersona[]): Node<PersonaNodeData>[] {
  return personas.map((persona) => ({
    id: persona.id,
    type: "persona",
    data: { persona },
    position: {
      x: Number.isFinite(persona.canvasX) ? persona.canvasX : Math.random() * 500,
      y: Number.isFinite(persona.canvasY) ? persona.canvasY : Math.random() * 300,
    },
  }));
}

function buildProfileDraft(persona: CanvasPersona): ProfileDraft {
  return {
    name: persona.name,
    primaryHandle: persona.primaryHandle,
    age: persona.age?.toString() ?? "",
    location: persona.location ?? "",
    politicalStance: persona.politicalStance ?? "",
    tone: persona.tone ?? "",
    bioMarkdown: persona.bioMarkdown ?? "",
    timezone: "UTC",
  };
}

function buildStyleDraft(persona: CanvasPersona): Record<PlatformName, string> {
  return {
    LINKEDIN: persona.platforms.find((platform) => platform.platform === "LINKEDIN")?.styleGuideMarkdown ?? "",
    X: persona.platforms.find((platform) => platform.platform === "X")?.styleGuideMarkdown ?? "",
    INSTAGRAM:
      persona.platforms.find((platform) => platform.platform === "INSTAGRAM")?.styleGuideMarkdown ?? "",
    REDDIT: persona.platforms.find((platform) => platform.platform === "REDDIT")?.styleGuideMarkdown ?? "",
  };
}

function buildCredentialDraft(persona: CanvasPersona): Record<PlatformName, PlatformCredentialDraft> {
  const byPlatform = new Map(persona.platforms.map((platform) => [platform.platform, platform]));

  return {
    LINKEDIN: {
      apiKey: byPlatform.get("LINKEDIN")?.credential?.apiKey ?? "",
      apiSecret: byPlatform.get("LINKEDIN")?.credential?.apiSecret ?? "",
      accessToken: byPlatform.get("LINKEDIN")?.credential?.accessToken ?? "",
      refreshToken: byPlatform.get("LINKEDIN")?.credential?.refreshToken ?? "",
      connectionHint: byPlatform.get("LINKEDIN")?.credential?.connectionHint ?? "",
    },
    X: {
      apiKey: byPlatform.get("X")?.credential?.apiKey ?? "",
      apiSecret: byPlatform.get("X")?.credential?.apiSecret ?? "",
      accessToken: byPlatform.get("X")?.credential?.accessToken ?? "",
      refreshToken: byPlatform.get("X")?.credential?.refreshToken ?? "",
      connectionHint: byPlatform.get("X")?.credential?.connectionHint ?? "",
    },
    INSTAGRAM: {
      apiKey: byPlatform.get("INSTAGRAM")?.credential?.apiKey ?? "",
      apiSecret: byPlatform.get("INSTAGRAM")?.credential?.apiSecret ?? "",
      accessToken: byPlatform.get("INSTAGRAM")?.credential?.accessToken ?? "",
      refreshToken: byPlatform.get("INSTAGRAM")?.credential?.refreshToken ?? "",
      connectionHint: byPlatform.get("INSTAGRAM")?.credential?.connectionHint ?? "",
    },
    REDDIT: {
      apiKey: byPlatform.get("REDDIT")?.credential?.apiKey ?? "",
      apiSecret: byPlatform.get("REDDIT")?.credential?.apiSecret ?? "",
      accessToken: byPlatform.get("REDDIT")?.credential?.accessToken ?? "",
      refreshToken: byPlatform.get("REDDIT")?.credential?.refreshToken ?? "",
      connectionHint: byPlatform.get("REDDIT")?.credential?.connectionHint ?? "",
    },
  };
}

function PersonaNode({ data, selected }: NodeProps<PersonaNodeData>) {
  const { persona } = data;
  const platformStates = PLATFORM_LIST.map((platform) => {
    const found = persona.platforms.find((entry) => entry.platform === platform);
    return {
      platform,
      status: found?.connectionStatus ?? "DISCONNECTED",
    } as const;
  });
  const activeCount = platformStates.filter((entry) => entry.status === "CONNECTED").length;
  const issueCount = platformStates.filter((entry) => entry.status === "ERROR").length;

  return (
    <div className={`persona-node ${selected ? "persona-node-selected" : ""}`}>
      <div className="persona-node-top">
        <div className="persona-node-header">
          <div className="persona-avatar">{persona.name.slice(0, 1).toUpperCase()}</div>
          <div>
            <p className="persona-name">{persona.name}</p>
            <p className="persona-handle">{persona.primaryHandle}</p>
          </div>
        </div>
        <div className={`persona-live-badge ${activeCount > 0 ? "persona-live-active" : "persona-live-idle"}`}>
          {activeCount}/4 Active
        </div>
      </div>

      <div className="persona-summary-row">
        <span>{issueCount > 0 ? `${issueCount} issue${issueCount > 1 ? "s" : ""}` : "No issues"}</span>
        <span>{persona.pendingDrafts} pending</span>
      </div>

      <div className="persona-platform-grid">
        {platformStates.map((entry) => (
          <div key={entry.platform} className={`platform-chip platform-chip-${entry.status.toLowerCase()}`}>
            <span className="platform-chip-brand">
              <span className="platform-chip-mark">{PLATFORM_LABELS[entry.platform]}</span>
              {PLATFORM_NAMES[entry.platform]}
            </span>
            <span className="platform-chip-state">
              <span className={`status-dot status-dot-${entry.status.toLowerCase()}`} />
              {STATUS_LABELS[entry.status]}
            </span>
          </div>
        ))}
      </div>

      <div className="persona-platform-track" aria-hidden="true">
        {platformStates.map((entry) => (
          <span
            key={entry.platform}
            className={`persona-platform-segment persona-platform-segment-${entry.status.toLowerCase()}`}
          />
        ))}
      </div>
    </div>
  );
}

const nodeTypes: NodeTypes = {
  persona: PersonaNode,
};

export function CampaignCanvasShell({ initialPersonas }: { initialPersonas: CanvasPersona[] }) {
  const router = useRouter();
  const [nodes, setNodes, onNodesChange] = useNodesState<PersonaNodeData>(buildNodes(initialPersonas));
  const [selectedPersonaId, setSelectedPersonaId] = useState<string | null>(initialPersonas[0]?.id ?? null);
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformName>("LINKEDIN");
  const [cockpitOpen, setCockpitOpen] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [cockpitStatus, setCockpitStatus] = useState<string | null>(null);
  const [cockpitError, setCockpitError] = useState<string | null>(null);
  const [profileDraft, setProfileDraft] = useState<ProfileDraft | null>(null);
  const [styleDraft, setStyleDraft] = useState<Record<PlatformName, string>>({
    LINKEDIN: "",
    X: "",
    INSTAGRAM: "",
    REDDIT: "",
  });
  const [credentialDraft, setCredentialDraft] = useState<Record<PlatformName, PlatformCredentialDraft>>({
    LINKEDIN: { ...PLATFORM_CREDENTIAL_BLANK },
    X: { ...PLATFORM_CREDENTIAL_BLANK },
    INSTAGRAM: { ...PLATFORM_CREDENTIAL_BLANK },
    REDDIT: { ...PLATFORM_CREDENTIAL_BLANK },
  });
  const [narratives, setNarratives] = useState<Narrative[]>([]);
  const [narrativeSidebarOpen, setNarrativeSidebarOpen] = useState(false);
  const [selectedNarrativeId, setSelectedNarrativeId] = useState<string | null>(null);
  const [selectedNarrativePersonaId, setSelectedNarrativePersonaId] = useState<string | null>(null);
  const [showCreateNarrativeForm, setShowCreateNarrativeForm] = useState(false);
  const [narrativeFormDraft, setNarrativeFormDraft] = useState<NarrativeFormDraft>({ title: "", description: "" });
  const [narrativeFormError, setNarrativeFormError] = useState<string | null>(null);

  const [isMutating, startTransition] = useTransition();
  const [isSavingProfile, startProfileSave] = useTransition();
  const [isSavingStyle, startStyleSave] = useTransition();
  const [isSavingCredential, startCredentialSave] = useTransition();
  const [isTestingConnection, startConnectionTest] = useTransition();
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance<PersonaNodeData> | null>(
    null,
  );

  useEffect(() => {
    setNodes(buildNodes(initialPersonas));

    setSelectedPersonaId((current) => {
      if (current && initialPersonas.some((persona) => persona.id === current)) {
        return current;
      }
      return initialPersonas[0]?.id ?? null;
    });
  }, [initialPersonas, setNodes]);

  const selectedPersona = useMemo(
    () => nodes.find((node) => node.id === selectedPersonaId)?.data.persona ?? null,
    [nodes, selectedPersonaId],
  );

  useEffect(() => {
    if (!selectedPersona) {
      setProfileDraft(null);
      setStyleDraft({ LINKEDIN: "", X: "", INSTAGRAM: "", REDDIT: "" });
      setCredentialDraft({
        LINKEDIN: { ...PLATFORM_CREDENTIAL_BLANK },
        X: { ...PLATFORM_CREDENTIAL_BLANK },
        INSTAGRAM: { ...PLATFORM_CREDENTIAL_BLANK },
        REDDIT: { ...PLATFORM_CREDENTIAL_BLANK },
      });
      return;
    }

    setProfileDraft(buildProfileDraft(selectedPersona));
    setStyleDraft(buildStyleDraft(selectedPersona));
    setCredentialDraft(buildCredentialDraft(selectedPersona));
    setCockpitStatus(null);
    setCockpitError(null);
  }, [selectedPersona]);

  const allPersonas = useMemo(() => nodes.map((node) => node.data.persona), [nodes]);

  const selectedNarrative = useMemo(
    () => narratives.find((n) => n.id === selectedNarrativeId) ?? null,
    [narratives, selectedNarrativeId],
  );

  const assignedNarrativePersonas = useMemo(() => {
    if (!selectedNarrative) {
      return [];
    }

    return selectedNarrative.personaSettings.flatMap((setting) => {
      const persona = allPersonas.find((candidate) => candidate.id === setting.personaId);
      if (!persona) {
        return [];
      }
      return [{ persona, settings: setting }];
    });
  }, [allPersonas, selectedNarrative]);

  const availableNarrativePersonas = useMemo(() => {
    if (!selectedNarrative) {
      return [];
    }

    const assignedIds = new Set(selectedNarrative.personaSettings.map((setting) => setting.personaId));
    return allPersonas.filter((persona) => !assignedIds.has(persona.id));
  }, [allPersonas, selectedNarrative]);

  const selectedNarrativePersonaSettings = useMemo(() => {
    if (!selectedNarrative || !selectedNarrativePersonaId) {
      return null;
    }

    return selectedNarrative.personaSettings.find((setting) => setting.personaId === selectedNarrativePersonaId) ?? null;
  }, [selectedNarrative, selectedNarrativePersonaId]);

  const selectedNarrativePersona = useMemo(() => {
    if (!selectedNarrativePersonaSettings) {
      return null;
    }

    return allPersonas.find((persona) => persona.id === selectedNarrativePersonaSettings.personaId) ?? null;
  }, [allPersonas, selectedNarrativePersonaSettings]);

  const selectedNarrativeScheduledPosts = useMemo(
    () => (selectedNarrative ? countScheduledPosts(selectedNarrative.personaSettings) : 0),
    [selectedNarrative],
  );
  const selectedNarrativeCanActivate = useMemo(
    () => (selectedNarrative ? canActivateNarrative(selectedNarrative) : false),
    [selectedNarrative],
  );

  useEffect(() => {
    if (!selectedNarrative) {
      setSelectedNarrativePersonaId(null);
      return;
    }

    const assignedIds = selectedNarrative.personaSettings.map((setting) => setting.personaId);
    setSelectedNarrativePersonaId((current) => {
      if (current && assignedIds.includes(current)) {
        return current;
      }
      return assignedIds[0] ?? null;
    });
  }, [selectedNarrative]);

  const selectedPlatformMeta = useMemo(
    () => selectedPersona?.platforms.find((platform) => platform.platform === selectedPlatform) ?? null,
    [selectedPersona, selectedPlatform],
  );
  const isLinkedInPlatform = selectedPlatform === "LINKEDIN";

  const handleCreateNarrative = () => {
    const title = narrativeFormDraft.title.trim();
    if (!title) {
      setNarrativeFormError("Title is required.");
      return;
    }
    const newNarrative: Narrative = {
      id: Math.random().toString(36).slice(2) + Date.now().toString(36),
      title,
      description: narrativeFormDraft.description.trim(),
      status: "draft",
      personaSettings: [],
    };
    setNarratives((current) => [...current, newNarrative]);
    setSelectedNarrativeId(newNarrative.id);
    setSelectedNarrativePersonaId(null);
    setNarrativeSidebarOpen(true);
    setShowCreateNarrativeForm(false);
    setNarrativeFormDraft({ title: "", description: "" });
    setNarrativeFormError(null);
  };

  const handleAddNarrativePersona = (narrativeId: string, personaId: string) => {
    setNarratives((current) =>
      current.map((n) =>
        n.id !== narrativeId
          ? n
          : n.personaSettings.some((setting) => setting.personaId === personaId)
            ? n
            : {
                ...n,
                personaSettings: [...n.personaSettings, { personaId, postCaps: buildNarrativePostCaps() }],
              },
      ),
    );
    setSelectedNarrativePersonaId(personaId);
  };

  const handleRemoveNarrativePersona = (narrativeId: string, personaId: string) => {
    setNarratives((current) =>
      current.map((n) =>
        n.id !== narrativeId
          ? n
          : {
              ...n,
              personaSettings: n.personaSettings.filter((setting) => setting.personaId !== personaId),
            },
      ),
    );
  };

  const handleUpdateNarrativePostCap = (
    narrativeId: string,
    personaId: string,
    platform: PlatformName,
    value: number,
  ) => {
    setNarratives((current) =>
      current.map((n) =>
        n.id !== narrativeId
          ? n
          : {
              ...n,
              personaSettings: n.personaSettings.map((setting) =>
                setting.personaId !== personaId
                  ? setting
                  : {
                      ...setting,
                      postCaps: { ...setting.postCaps, [platform]: value },
                    },
              ),
            },
      ),
    );
  };

  const handleApplyPostPreset = (narrativeId: string, personaId: string, presetValue: 0 | 1) => {
    const nextCaps = buildNarrativePostCaps();
    for (const platform of PLATFORM_LIST) {
      nextCaps[platform] = presetValue;
    }

    setNarratives((current) =>
      current.map((n) =>
        n.id !== narrativeId
          ? n
          : {
              ...n,
              personaSettings: n.personaSettings.map((setting) =>
                setting.personaId !== personaId
                  ? setting
                  : {
                      ...setting,
                      postCaps: nextCaps,
                    },
              ),
            },
      ),
    );
  };

  const handleToggleNarrativeStatus = (narrativeId: string) => {
    setNarratives((current) =>
      current.map((n) =>
        n.id !== narrativeId
          ? n
          : n.status === "draft" && !canActivateNarrative(n)
            ? n
            : { ...n, status: n.status === "active" ? "draft" : "active" },
      ),
    );
  };

  const handleCreatePersona = async (formData: FormData) => {
    setCreateError(null);

    const name = String(formData.get("name") ?? "").trim();
    const primaryHandle = String(formData.get("primaryHandle") ?? "").trim();

    if (!name || !primaryHandle) {
      setCreateError("Name and handle are required.");
      return;
    }

    startTransition(async () => {
      const result = await createPersonaAction({
        name,
        primaryHandle,
        tone: "balanced",
        timezone: "UTC",
      });

      if (!result.ok) {
        setCreateError(result.error);
        return;
      }

      setShowCreateForm(false);
      router.refresh();
    });
  };

  const handleSaveProfile = () => {
    if (!selectedPersona || !profileDraft) {
      return;
    }

    setCockpitError(null);
    setCockpitStatus(null);

    startProfileSave(async () => {
      const ageNumber = profileDraft.age.trim().length > 0 ? Number(profileDraft.age) : undefined;

      const result = await updatePersonaProfileAction({
        personaId: selectedPersona.id,
        name: profileDraft.name,
        primaryHandle: profileDraft.primaryHandle,
        avatarUrl: "",
        age: Number.isFinite(ageNumber) ? ageNumber : undefined,
        location: profileDraft.location,
        politicalStance: profileDraft.politicalStance,
        tone: profileDraft.tone,
        bioMarkdown: profileDraft.bioMarkdown,
        timezone: profileDraft.timezone,
      });

      if (!result.ok) {
        setCockpitError(result.error);
        return;
      }

      setCockpitStatus("Profile saved.");
      router.refresh();
    });
  };

  const handleSaveStyleGuide = () => {
    if (!selectedPersona) {
      return;
    }

    setCockpitError(null);
    setCockpitStatus(null);

    startStyleSave(async () => {
      const result = await updatePersonaPlatformStyleAction({
        personaId: selectedPersona.id,
        platform: selectedPlatform,
        styleGuideMarkdown: styleDraft[selectedPlatform] ?? "",
      });

      if (!result.ok) {
        setCockpitError(result.error);
        return;
      }

      setCockpitStatus(`${selectedPlatform} style guide saved.`);
      router.refresh();
    });
  };

  const handleSaveCredential = () => {
    if (!selectedPersona) {
      return;
    }

    setCockpitError(null);
    setCockpitStatus(null);

    startCredentialSave(async () => {
      const draft = credentialDraft[selectedPlatform];

      const result = await updatePersonaPlatformCredentialAction({
        personaId: selectedPersona.id,
        platform: selectedPlatform,
        apiKey: isLinkedInPlatform ? "" : (draft?.apiKey ?? ""),
        apiSecret: isLinkedInPlatform ? "" : (draft?.apiSecret ?? ""),
        accessToken: isLinkedInPlatform ? "" : (draft?.accessToken ?? ""),
        refreshToken: isLinkedInPlatform ? "" : (draft?.refreshToken ?? ""),
        connectionHint: draft?.connectionHint ?? "",
      });

      if (!result.ok) {
        setCockpitError(result.error);
        return;
      }

      setCockpitStatus(
        isLinkedInPlatform ? "LinkedIn manual setup saved." : `${selectedPlatform} credentials saved locally.`,
      );
      router.refresh();
    });
  };

  const handleTestConnection = () => {
    if (!selectedPersona) {
      return;
    }

    setCockpitError(null);
    setCockpitStatus(null);

    startConnectionTest(async () => {
      const result = await testPersonaPlatformConnectionAction({
        personaId: selectedPersona.id,
        platform: selectedPlatform,
      });

      if (!result.ok) {
        setCockpitError(result.error);
        return;
      }

      setCockpitStatus(`${isLinkedInPlatform ? "LinkedIn Manual Mode" : selectedPlatform}: ${result.data.message}`);
      router.refresh();
    });
  };

  return (
    <div className="canvas-page">
      <div className="canvas-field">
        <ReactFlow
          nodes={nodes}
          edges={[]}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onNodeClick={(_, node) => {
            setSelectedPersonaId(node.id);
            setCockpitOpen(true);
          }}
          onNodeDragStop={(_, node) => {
            startTransition(async () => {
              await updatePersonaPositionAction({
                personaId: node.id,
                x: node.position.x,
                y: node.position.y,
              });
            });
          }}
          onInit={setReactFlowInstance}
          fitView
          minZoom={0.3}
          maxZoom={1.8}
          proOptions={{ hideAttribution: true }}
        >
          <Background gap={32} color="#dce3f2" />
        </ReactFlow>
      </div>

      <div className="canvas-top-controls">
        <div className="brand-strip">
          <span className="logo-mark">
            <Radar size={15} />
          </span>
          <div>
            <p className="logo-title">BigBro</p>
            <p className="logo-tagline">They post. They reply. You just approve.</p>
          </div>
        </div>

        <div className="canvas-actions">
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus size={16} />
            New Persona
          </Button>

          <Button variant="outline" onClick={() => setShowCreateNarrativeForm(true)}>
            <Megaphone size={16} />
            New Narrative
          </Button>

          <Button
            type="button"
            size="icon"
            variant="outline"
            aria-label="Zoom in"
            onClick={() => reactFlowInstance?.zoomIn({ duration: 150 })}
          >
            <ZoomIn size={15} />
          </Button>

          <Button
            type="button"
            size="icon"
            variant="outline"
            aria-label="Zoom out"
            onClick={() => reactFlowInstance?.zoomOut({ duration: 150 })}
          >
            <ZoomOut size={15} />
          </Button>

          <Button asChild variant="outline">
            <Link href="/approval-queue">Approval Queue</Link>
          </Button>

          <Button type="button" size="icon" variant="outline" aria-label="Notifications">
            <Bell size={16} />
          </Button>
        </div>
      </div>

      {/* ── Narrative sidebar ── */}
      <aside className={`narrative-sidebar ${narrativeSidebarOpen ? "narrative-sidebar-open" : ""}`}>
        <div className="cockpit-shell-title">
          {selectedNarrative ? (
            <>
              <button
                className="narrative-back-btn"
                onClick={() => setSelectedNarrativeId(null)}
                aria-label="Back to narratives list"
              >
                ← All Narratives
              </button>
              <h2 style={{ marginTop: "0.4rem" }}>{selectedNarrative.title}</h2>
              <p>{selectedNarrative.description || "Add details so collaborators know the goal."}</p>
            </>
          ) : (
            <>
              <h2>Narratives</h2>
              <p>
                {narratives.length === 0
                  ? "No narratives yet."
                  : `${narratives.filter((n) => n.status === "active").length} active · ${narratives.length} total`}
              </p>
            </>
          )}
        </div>

        {selectedNarrative ? (
          <div className="space-y-4">
            <section className="cockpit-section">
              <div className="narrative-header-row">
                <h3 className="cockpit-section-title">Activation</h3>
                <span className={`narrative-status-badge narrative-status-${selectedNarrative.status}`}>
                  {selectedNarrative.status === "active" ? "Active" : "Draft"}
                </span>
              </div>
              <p className="cockpit-section-note">
                {selectedNarrative.personaSettings.length} persona
                {selectedNarrative.personaSettings.length === 1 ? "" : "s"} assigned · {selectedNarrativeScheduledPosts}{" "}
                scheduled posts
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleToggleNarrativeStatus(selectedNarrative.id)}
                disabled={selectedNarrative.status === "draft" && !selectedNarrativeCanActivate}
              >
                {selectedNarrative.status === "active" ? "Pause (set to Draft)" : "Activate"}
              </Button>
              {selectedNarrative.status === "draft" && !selectedNarrativeCanActivate ? (
                <p className="cockpit-section-note">
                  To activate: add at least one persona and set at least one post cap above 0.
                </p>
              ) : null}
            </section>

            <section className="cockpit-section">
              <h3 className="cockpit-section-title">Add Personas</h3>
              {allPersonas.length === 0 ? (
                <p className="cockpit-section-note">No personas exist yet. Create one on the canvas.</p>
              ) : availableNarrativePersonas.length === 0 ? (
                <p className="cockpit-section-note">All personas are already added to this narrative.</p>
              ) : (
                <div className="narrative-persona-list">
                  {availableNarrativePersonas.map((persona) => (
                    <div key={persona.id} className="narrative-persona-row">
                      <div className="narrative-persona-row-main">
                        <span
                          className="persona-avatar"
                          style={{ height: "1.5rem", width: "1.5rem", fontSize: "0.65rem", flexShrink: 0 }}
                        >
                          {persona.name.slice(0, 1).toUpperCase()}
                        </span>
                        <div className="narrative-persona-labels">
                          <span className="narrative-persona-name">{persona.name}</span>
                          <span className="narrative-persona-handle">{persona.primaryHandle}</span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAddNarrativePersona(selectedNarrative.id, persona.id)}
                      >
                        Add
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="cockpit-section">
              <h3 className="cockpit-section-title">Assigned Personas</h3>
              {assignedNarrativePersonas.length === 0 ? (
                <p className="cockpit-section-note">No one assigned yet. Add a persona above.</p>
              ) : (
                <div className="narrative-persona-list">
                  {assignedNarrativePersonas.map(({ persona, settings }) => {
                    const isSelected = selectedNarrativePersonaId === persona.id;
                    const scheduledPostsForPersona = PLATFORM_LIST.reduce(
                      (sum, platform) => sum + (settings.postCaps[platform] ?? 0),
                      0,
                    );
                    return (
                      <div key={persona.id} className={`narrative-assigned-row ${isSelected ? "narrative-assigned-selected" : ""}`}>
                        <button
                          type="button"
                          className="narrative-assigned-select"
                          onClick={() => setSelectedNarrativePersonaId(persona.id)}
                        >
                          <span
                            className="persona-avatar"
                            style={{ height: "1.5rem", width: "1.5rem", fontSize: "0.65rem", flexShrink: 0 }}
                          >
                            {persona.name.slice(0, 1).toUpperCase()}
                          </span>
                          <div className="narrative-persona-labels">
                            <span className="narrative-persona-name">{persona.name}</span>
                            <span className="narrative-persona-handle">{persona.primaryHandle}</span>
                          </div>
                          <span className="narrative-assigned-posts">{scheduledPostsForPersona} posts</span>
                        </button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => handleRemoveNarrativePersona(selectedNarrative.id, persona.id)}
                        >
                          Remove
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            <section className="cockpit-section">
              <h3 className="cockpit-section-title">Persona-Specific Posting</h3>
              <p className="cockpit-section-note">
                Defaults begin at 0. Pick an assigned persona and tune their limits.
              </p>
              {selectedNarrativePersona && selectedNarrativePersonaSettings ? (
                <>
                  <div className="narrative-persona-settings-head">
                    <div className="narrative-persona-row-main">
                      <span
                        className="persona-avatar"
                        style={{ height: "1.5rem", width: "1.5rem", fontSize: "0.65rem", flexShrink: 0 }}
                      >
                        {selectedNarrativePersona.name.slice(0, 1).toUpperCase()}
                      </span>
                      <div className="narrative-persona-labels">
                        <span className="narrative-persona-name">{selectedNarrativePersona.name}</span>
                        <span className="narrative-persona-handle">{selectedNarrativePersona.primaryHandle}</span>
                      </div>
                    </div>
                    <div className="narrative-preset-row">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleApplyPostPreset(selectedNarrative.id, selectedNarrativePersona.id, 0)}
                      >
                        All 0
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleApplyPostPreset(selectedNarrative.id, selectedNarrativePersona.id, 1)}
                      >
                        All 1
                      </Button>
                    </div>
                  </div>
                  <div className="narrative-caps-grid">
                    {PLATFORM_LIST.map((platform) => (
                      <label key={platform} className="cockpit-field">
                        <span>{PLATFORM_NAMES[platform]}</span>
                        <Input
                          type="number"
                          min={0}
                          max={50}
                          value={selectedNarrativePersonaSettings.postCaps[platform]}
                          onChange={(e) =>
                            handleUpdateNarrativePostCap(
                              selectedNarrative.id,
                              selectedNarrativePersona.id,
                              platform,
                              Math.max(0, Math.min(50, Number(e.target.value))),
                            )
                          }
                        />
                      </label>
                    ))}
                  </div>
                </>
              ) : (
                <p className="cockpit-section-note">
                  Select an assigned persona to edit their posting settings.
                </p>
              )}
            </section>
          </div>
        ) : (
          <div className="narrative-list">
            <div className="narrative-list-toolbar">
              <Button size="sm" onClick={() => setShowCreateNarrativeForm(true)}>
                <Plus size={14} />
                New Narrative
              </Button>
            </div>
            {narratives.length === 0 ? (
              <div className="narrative-empty">
                <Megaphone size={24} style={{ color: "var(--bb-ink-muted)", opacity: 0.4 }} />
                <p>Create a narrative to broadcast a message through your personas.</p>
                <Button size="sm" onClick={() => setShowCreateNarrativeForm(true)}>
                  <Plus size={14} />
                  New Narrative
                </Button>
              </div>
            ) : (
              narratives.map((narrative) => (
                <button
                  key={narrative.id}
                  className="narrative-item"
                  onClick={() => setSelectedNarrativeId(narrative.id)}
                >
                  <div className="narrative-header-row">
                    <span className="narrative-item-title">{narrative.title}</span>
                    <span className={`narrative-status-badge narrative-status-${narrative.status}`}>
                      {narrative.status === "active" ? "Active" : "Draft"}
                    </span>
                  </div>
                  {narrative.description ? (
                    <p className="narrative-item-desc">{narrative.description}</p>
                  ) : null}
                  <p className="narrative-item-meta">
                    {narrative.personaSettings.length} persona
                    {narrative.personaSettings.length !== 1 ? "s" : ""} assigned ·{" "}
                    {countScheduledPosts(narrative.personaSettings)} posts configured ·{" "}
                    {canActivateNarrative(narrative) ? "ready" : "needs setup"}
                  </p>
                </button>
              ))
            )}
          </div>
        )}
      </aside>

      <Button
        type="button"
        size="default"
        variant="outline"
        className="narrative-toggle"
        onClick={() => setNarrativeSidebarOpen((current) => !current)}
        aria-label={narrativeSidebarOpen ? "Hide narratives" : "Show narratives"}
      >
        {narrativeSidebarOpen ? (
          <>
            <ChevronLeft size={16} /> Hide Narratives
          </>
        ) : (
          <>
            <ChevronRight size={16} /> Narratives
          </>
        )}
      </Button>

      <aside className={`cockpit-floating ${cockpitOpen ? "cockpit-open" : ""}`}>
        <div className="cockpit-shell-title">
          <h2>Persona Cockpit</h2>
          <p>
            {selectedPersona
              ? `Editing ${selectedPersona.name}.`
              : "Select a persona node to open live controls."}
          </p>
        </div>

        {selectedPersona && profileDraft ? (
          <div className="space-y-4">
            <section className="cockpit-section">
              <h3 className="cockpit-section-title">Personality & Profile</h3>
              <div className="cockpit-grid">
                <label className="cockpit-field">
                  <span>Name</span>
                  <Input
                    value={profileDraft.name}
                    onChange={(event) =>
                      setProfileDraft((current) =>
                        current ? { ...current, name: event.target.value } : current,
                      )
                    }
                  />
                </label>
                <label className="cockpit-field">
                  <span>Handle</span>
                  <Input
                    value={profileDraft.primaryHandle}
                    onChange={(event) =>
                      setProfileDraft((current) =>
                        current ? { ...current, primaryHandle: event.target.value } : current,
                      )
                    }
                  />
                </label>
                <label className="cockpit-field">
                  <span>Age</span>
                  <Input
                    value={profileDraft.age}
                    type="number"
                    onChange={(event) =>
                      setProfileDraft((current) =>
                        current ? { ...current, age: event.target.value } : current,
                      )
                    }
                  />
                </label>
                <label className="cockpit-field">
                  <span>Location</span>
                  <Input
                    value={profileDraft.location}
                    onChange={(event) =>
                      setProfileDraft((current) =>
                        current ? { ...current, location: event.target.value } : current,
                      )
                    }
                  />
                </label>
                <label className="cockpit-field">
                  <span>Political Stance</span>
                  <Input
                    value={profileDraft.politicalStance}
                    onChange={(event) =>
                      setProfileDraft((current) =>
                        current ? { ...current, politicalStance: event.target.value } : current,
                      )
                    }
                  />
                </label>
                <label className="cockpit-field">
                  <span>Tone</span>
                  <Input
                    value={profileDraft.tone}
                    onChange={(event) =>
                      setProfileDraft((current) =>
                        current ? { ...current, tone: event.target.value } : current,
                      )
                    }
                  />
                </label>
              </div>

              <label className="cockpit-field">
                <span>General Markdown Personality</span>
                <Textarea
                  className="min-h-28"
                  value={profileDraft.bioMarkdown}
                  onChange={(event) =>
                    setProfileDraft((current) =>
                      current ? { ...current, bioMarkdown: event.target.value } : current,
                    )
                  }
                />
              </label>

              <Button onClick={handleSaveProfile} disabled={isSavingProfile}>
                {isSavingProfile ? "Saving..." : "Save Profile"}
              </Button>
            </section>

            <section className="cockpit-section">
              <h3 className="cockpit-section-title">Platform Style Guides</h3>
              <div className="platform-tabs">
                {PLATFORM_LIST.map((platform) => (
                  <Button
                    key={platform}
                    variant={platform === selectedPlatform ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedPlatform(platform)}
                  >
                    {platform}
                  </Button>
                ))}
              </div>

              <div className="platform-status-row">
                <span
                  className={`status-inline status-inline-${(selectedPlatformMeta?.connectionStatus ?? "DISCONNECTED").toLowerCase()}`}
                >
                  {STATUS_LABELS[selectedPlatformMeta?.connectionStatus ?? "DISCONNECTED"]}
                </span>
                <span>
                  Last test: {selectedPlatformMeta?.lastTestedAt ? new Date(selectedPlatformMeta.lastTestedAt).toLocaleString() : "Never"}
                </span>
              </div>

              <label className="cockpit-field">
                <span>{selectedPlatform} Style Guide (Markdown)</span>
                <Textarea
                  className="min-h-28"
                  value={styleDraft[selectedPlatform] ?? ""}
                  onChange={(event) =>
                    setStyleDraft((current) => ({
                      ...current,
                      [selectedPlatform]: event.target.value,
                    }))
                  }
                />
              </label>

              <Button onClick={handleSaveStyleGuide} disabled={isSavingStyle}>
                {isSavingStyle ? "Saving..." : `Save ${selectedPlatform} Guide`}
              </Button>
            </section>

            <section className="cockpit-section">
              <h3 className="cockpit-section-title">Platform Credentials (Local)</h3>
              <p className="cockpit-section-note">
                {isLinkedInPlatform
                  ? "LinkedIn API keys are disabled for MVP due to app approval limits. Use manual mode setup."
                  : "Local MVP mode: credentials are stored in your local database for testing."}
              </p>

              {isLinkedInPlatform ? null : (
                <>
                  <label className="cockpit-field">
                    <span>{selectedPlatform} API Key</span>
                    <Input
                      value={credentialDraft[selectedPlatform]?.apiKey ?? ""}
                      onChange={(event) =>
                        setCredentialDraft((current) => ({
                          ...current,
                          [selectedPlatform]: {
                            ...current[selectedPlatform],
                            apiKey: event.target.value,
                          },
                        }))
                      }
                    />
                  </label>

                  <label className="cockpit-field">
                    <span>{selectedPlatform} API Secret</span>
                    <Input
                      value={credentialDraft[selectedPlatform]?.apiSecret ?? ""}
                      onChange={(event) =>
                        setCredentialDraft((current) => ({
                          ...current,
                          [selectedPlatform]: {
                            ...current[selectedPlatform],
                            apiSecret: event.target.value,
                          },
                        }))
                      }
                    />
                  </label>

                  <label className="cockpit-field">
                    <span>{selectedPlatform} Access Token</span>
                    <Input
                      value={credentialDraft[selectedPlatform]?.accessToken ?? ""}
                      onChange={(event) =>
                        setCredentialDraft((current) => ({
                          ...current,
                          [selectedPlatform]: {
                            ...current[selectedPlatform],
                            accessToken: event.target.value,
                          },
                        }))
                      }
                    />
                  </label>

                  <label className="cockpit-field">
                    <span>{selectedPlatform} Refresh Token</span>
                    <Input
                      value={credentialDraft[selectedPlatform]?.refreshToken ?? ""}
                      onChange={(event) =>
                        setCredentialDraft((current) => ({
                          ...current,
                          [selectedPlatform]: {
                            ...current[selectedPlatform],
                            refreshToken: event.target.value,
                          },
                        }))
                      }
                    />
                  </label>
                </>
              )}

              <label className="cockpit-field">
                <span>{isLinkedInPlatform ? "LinkedIn profile URL (manual mode)" : "Connection Hint (optional)"}</span>
                <Input
                  value={credentialDraft[selectedPlatform]?.connectionHint ?? ""}
                  onChange={(event) =>
                    setCredentialDraft((current) => ({
                      ...current,
                      [selectedPlatform]: {
                        ...current[selectedPlatform],
                        connectionHint: event.target.value,
                      },
                    }))
                  }
                  placeholder={
                    isLinkedInPlatform
                      ? "https://www.linkedin.com/in/your-handle"
                      : "Profile id, app id, or note for testing"
                  }
                />
              </label>

              <div className="cockpit-button-row">
                <Button onClick={handleSaveCredential} disabled={isSavingCredential}>
                  {isSavingCredential
                    ? "Saving..."
                    : isLinkedInPlatform
                      ? "Save LinkedIn Manual Setup"
                      : `Save ${selectedPlatform} Credentials`}
                </Button>
                <Button variant="outline" onClick={handleTestConnection} disabled={isTestingConnection}>
                  {isTestingConnection
                    ? "Testing..."
                    : isLinkedInPlatform
                      ? "Validate LinkedIn Manual Setup"
                      : `Test ${selectedPlatform} Connection`}
                </Button>
              </div>
            </section>

            <div className="dock-row">
              <span>Pending drafts</span>
              <span>{selectedPersona.pendingDrafts}</span>
            </div>

            {cockpitStatus ? <p className="cockpit-status-success">{cockpitStatus}</p> : null}
            {cockpitError ? <p className="cockpit-status-error">{cockpitError}</p> : null}
          </div>
        ) : (
          <div className="dock-row">
            <span>No persona selected</span>
            <span>Idle</span>
          </div>
        )}
      </aside>

      <Button
        type="button"
        size="default"
        variant="outline"
        className="cockpit-toggle"
        onClick={() => setCockpitOpen((current) => !current)}
        aria-label={cockpitOpen ? "Hide persona cockpit" : "Show persona cockpit"}
      >
        {cockpitOpen ? (
          <>
            <ChevronRight size={16} /> Hide Cockpit
          </>
        ) : (
          <>
            <ChevronLeft size={16} /> Open Cockpit
          </>
        )}
      </Button>

      <Dialog
        open={showCreateNarrativeForm}
        onOpenChange={(open) => {
          setShowCreateNarrativeForm(open);
          if (!open) setNarrativeFormError(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Narrative</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3">
            <label className="cockpit-field">
              Title
              <Input
                value={narrativeFormDraft.title}
                placeholder="Product Launch Q2"
                onChange={(e) => setNarrativeFormDraft((current) => ({ ...current, title: e.target.value }))}
              />
            </label>
            <label className="cockpit-field">
              Description (optional)
              <Textarea
                value={narrativeFormDraft.description}
                placeholder="Describe what this narrative is about..."
                onChange={(e) => setNarrativeFormDraft((current) => ({ ...current, description: e.target.value }))}
              />
            </label>
            <p className="cockpit-section-note">
              Assigned personas start with post limits set to 0 on every platform.
            </p>
            {narrativeFormError ? <p className="form-error">{narrativeFormError}</p> : null}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowCreateNarrativeForm(false);
                setNarrativeFormError(null);
              }}
            >
              Cancel
            </Button>
            <Button type="button" onClick={handleCreateNarrative}>
              Create Narrative
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={showCreateForm}
        onOpenChange={(open) => {
          setShowCreateForm(open);
          if (!open) setCreateError(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Persona</DialogTitle>
          </DialogHeader>
          <form
            action={handleCreatePersona}
            onSubmit={() => setCreateError(null)}
            className="grid gap-3"
          >
            <label className="cockpit-field">
              Name
              <Input name="name" required placeholder="Atlas Hume" />
            </label>
            <label className="cockpit-field">
              Primary Handle
              <Input name="primaryHandle" required placeholder="@atlashume" />
            </label>
            {createError ? <p className="form-error">{createError}</p> : null}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreateForm(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isMutating}>
                {isMutating ? "Saving..." : "Create Persona"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
