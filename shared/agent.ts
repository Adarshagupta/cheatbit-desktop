// LOCAL PLACEHOLDER: the original shared/agent.ts was never committed to the
// repo. This reconstructs the shape used by the renderer and IPC layer so the
// app builds. Replace with the real file when it is pushed.

export type AgentStatus =
  | "idle"
  | "planning"
  | "awaiting_workspace"
  | "awaiting_approval"
  | "running"
  | "completed"
  | "failed"
  | "stopped"

export interface AgentPhase {
  id: string
  title: string
  description?: string
  status?: string
}

export interface AgentEvent {
  id?: string
  message: string
  timestamp?: number
  type?: string
}

export interface AgentArtifact {
  id?: string
  path: string
  label?: string
}

export interface AgentState {
  taskId: string | null
  status: AgentStatus
  prompt: string
  workspacePath: string | null
  phases: AgentPhase[]
  activePhaseId: string | null
  events: AgentEvent[]
  artifacts: AgentArtifact[]
  latestError: string | null
}

export const EMPTY_AGENT_STATE: AgentState = {
  taskId: null,
  status: "idle",
  prompt: "",
  workspacePath: null,
  phases: [],
  activePhaseId: null,
  events: [],
  artifacts: [],
  latestError: null,
}
