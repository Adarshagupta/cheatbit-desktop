// LOCAL PLACEHOLDER: the original VoiceAssistantPanel was never committed.
// AssistantChat already implements the voice UI via panelMode="voice", so
// this thin wrapper mirrors GeneralChatPanel.
import { AssistantChat, GENERAL_CHAT_QUERY_KEY } from "./AssistantChat"

interface VoiceAssistantPanelProps {
  computerTaskRequest?: {
    id: string
    task: string
  } | null
  voiceAutoStartSignal?: string | null
  onComputerTaskRequestConsumed?: () => void
}

export function VoiceAssistantPanel({
  computerTaskRequest = null,
  voiceAutoStartSignal = null,
  onComputerTaskRequestConsumed,
}: VoiceAssistantPanelProps) {
  return (
    <div className="w-[var(--sylica-widget-panel-width)] min-w-[var(--sylica-widget-panel-width)] max-w-[var(--sylica-widget-panel-width)] space-y-3">
      <AssistantChat
        queryKey={GENERAL_CHAT_QUERY_KEY}
        mode="general"
        panelMode="voice"
        voiceAutoStartSignal={voiceAutoStartSignal}
        computerTaskRequest={computerTaskRequest}
        onComputerTaskRequestConsumed={onComputerTaskRequestConsumed}
        placeholder="Message Sylica AI..."
        maxHeightClassName="max-h-[22rem]"
        className="w-full min-w-0"
      />
    </div>
  )
}
