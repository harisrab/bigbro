"use client";

import Link from "next/link";
import {
  Bell,
  ChevronLeft,
  ChevronRight,
  Plus,
  Radar,
  Search,
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
import { createPersonaAction, updatePersonaPositionAction } from "@/lib/actions/personas";
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
  }>;
};

type PersonaNodeData = {
  persona: CanvasPersona;
};

const PLATFORM_LABELS: Record<PlatformName, string> = {
  LINKEDIN: "in",
  X: "x",
  INSTAGRAM: "ig",
  REDDIT: "rd",
};

const PLATFORM_FILTERS: Array<{ label: string; value: "ALL" | PlatformName }> = [
  { label: "All Platforms", value: "ALL" },
  { label: "LinkedIn", value: "LINKEDIN" },
  { label: "X", value: "X" },
  { label: "Instagram", value: "INSTAGRAM" },
  { label: "Reddit", value: "REDDIT" },
];

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

function PersonaNode({ data, selected }: NodeProps<PersonaNodeData>) {
  const { persona } = data;

  return (
    <div className={`persona-node ${selected ? "persona-node-selected" : ""}`}>
      <div className="persona-node-header">
        <div className="persona-avatar">{persona.name.slice(0, 1).toUpperCase()}</div>
        <div>
          <p className="persona-name">{persona.name}</p>
          <p className="persona-handle">{persona.primaryHandle}</p>
        </div>
      </div>

      <div className="persona-platforms">
        {(["LINKEDIN", "X", "INSTAGRAM", "REDDIT"] as PlatformName[]).map((platform) => {
          const found = persona.platforms.find((entry) => entry.platform === platform);
          return (
            <span
              key={platform}
              className={`platform-pill platform-${(found?.connectionStatus ?? "DISCONNECTED").toLowerCase()}`}
              title={`${platform}: ${found?.connectionStatus ?? "DISCONNECTED"}`}
            >
              {PLATFORM_LABELS[platform]}
            </span>
          );
        })}
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
  const [search, setSearch] = useState("");
  const [platformFilter, setPlatformFilter] = useState<"ALL" | PlatformName>("ALL");
  const [selectedPersonaId, setSelectedPersonaId] = useState<string | null>(initialPersonas[0]?.id ?? null);
  const [cockpitOpen, setCockpitOpen] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
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

  const visibleNodes = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return nodes.filter((node) => {
      const persona = node.data.persona;

      const matchesSearch =
        normalizedSearch.length === 0 ||
        persona.name.toLowerCase().includes(normalizedSearch) ||
        persona.primaryHandle.toLowerCase().includes(normalizedSearch);

      const matchesPlatform =
        platformFilter === "ALL" ||
        persona.platforms.some((platform) => platform.platform === platformFilter);

      return matchesSearch && matchesPlatform;
    });
  }, [nodes, search, platformFilter]);

  const selectedPersona = useMemo(
    () => nodes.find((node) => node.id === selectedPersonaId)?.data.persona ?? null,
    [nodes, selectedPersonaId],
  );

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

  return (
    <div className="canvas-page">
      <div className="canvas-field">
        <ReactFlow
          nodes={visibleNodes}
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
          <button className="primary-btn" onClick={() => setShowCreateForm(true)}>
            <Plus size={16} />
            New Persona
          </button>

          <select
            className="platform-filter"
            value={platformFilter}
            onChange={(event) => setPlatformFilter(event.target.value as "ALL" | PlatformName)}
            aria-label="Filter by platform"
          >
            {PLATFORM_FILTERS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <label className="search-input">
            <Search size={14} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              type="search"
              placeholder="Search personas"
              aria-label="Search personas"
            />
          </label>

          <button
            type="button"
            className="icon-button"
            aria-label="Zoom in"
            onClick={() => reactFlowInstance?.zoomIn({ duration: 150 })}
          >
            <ZoomIn size={15} />
          </button>

          <button
            type="button"
            className="icon-button"
            aria-label="Zoom out"
            onClick={() => reactFlowInstance?.zoomOut({ duration: 150 })}
          >
            <ZoomOut size={15} />
          </button>

          <Link className="ghost-btn" href="/approval-queue">
            Approval Queue
          </Link>

          <button type="button" className="icon-button" aria-label="Notifications">
            <Bell size={16} />
          </button>
        </div>
      </div>

      <aside className={`cockpit-floating ${cockpitOpen ? "cockpit-open" : ""}`}>
        <div className="cockpit-shell-title">
          <h2>Persona Cockpit</h2>
          <p>
            {selectedPersona
              ? `Live controls for ${selectedPersona.name}.`
              : "Select a persona node to open live controls."}
          </p>
        </div>

        {selectedPersona ? (
          <div className="space-y-3">
            <div className="dock-row">
              <span>Name</span>
              <span>{selectedPersona.name}</span>
            </div>
            <div className="dock-row">
              <span>Handle</span>
              <span>{selectedPersona.primaryHandle}</span>
            </div>
            <div className="dock-row">
              <span>Tone</span>
              <span>{selectedPersona.tone ?? "Not set"}</span>
            </div>
            <div className="dock-row">
              <span>Location</span>
              <span>{selectedPersona.location ?? "Not set"}</span>
            </div>
            <div className="dock-row">
              <span>Pending drafts</span>
              <span>{selectedPersona.pendingDrafts}</span>
            </div>
          </div>
        ) : (
          <div className="dock-row">
            <span>No persona selected</span>
            <span>Idle</span>
          </div>
        )}
      </aside>

      <button
        type="button"
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
      </button>

      {showCreateForm ? (
        <div className="create-persona-modal" role="dialog" aria-modal="true" aria-label="Create new persona">
          <form
            className="create-persona-card"
            action={handleCreatePersona}
            onSubmit={() => {
              setCreateError(null);
            }}
          >
            <h3>Create New Persona</h3>
            <label>
              Name
              <input name="name" required placeholder="Atlas Hume" />
            </label>
            <label>
              Primary Handle
              <input name="primaryHandle" required placeholder="@atlashume" />
            </label>
            {createError ? <p className="form-error">{createError}</p> : null}
            <div className="create-actions">
              <button type="button" className="ghost-btn" onClick={() => setShowCreateForm(false)}>
                Cancel
              </button>
              <button type="submit" className="primary-btn" disabled={isPending}>
                {isPending ? "Saving..." : "Create Persona"}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
