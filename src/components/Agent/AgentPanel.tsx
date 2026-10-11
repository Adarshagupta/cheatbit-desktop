// LOCAL PLACEHOLDER: the original AgentPanel was never committed. The main
// process has no agent controller in this build either, so Agent Mode just
// shows a notice. Replace with the real component when it is pushed.
import type { AgentState } from "../../../shared/agent"
import type { ComputerUseState } from "../../../shared/followUpChat"

interface AgentPanelProps {
  state: AgentState
  onStateChange: (state: AgentState) => void
  onOpenInterviewMode?: () => void
  computerUseState?: ComputerUseState
  onStartComputerTask?: (task: string) => Promise<void>
  onStopComputerTask?: () => void
  onResumeComputerTask?: () => void
}

export default function AgentPanel({ state }: AgentPanelProps) {
  return (
    <div className="w-[var(--sylica-widget-panel-width)] min-w-[var(--sylica-widget-panel-width)] max-w-[var(--sylica-widget-panel-width)] rounded-xl bg-black/60 p-4 text-sm text-white/80">
      <p className="font-medium text-white">Agent Mode</p>
      <p className="mt-1 text-white/60">
        Agent Mode isn't available in this build.
      </p>
      {state.latestError && (
        <p className="mt-2 text-red-300">{state.latestError}</p>
      )}
    </div>
  )
}
