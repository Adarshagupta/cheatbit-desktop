// Mirrors config.voiceModeEnabled. App.tsx sets it before the main UI mounts,
// and saving Settings reloads the renderer, so it never goes stale.
let voiceModeEnabled = true

export function setVoiceModeEnabled(enabled: boolean): void {
  voiceModeEnabled = enabled
}

export function isVoiceModeEnabled(): boolean {
  return voiceModeEnabled
}
