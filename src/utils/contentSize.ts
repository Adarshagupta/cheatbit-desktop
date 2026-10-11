export function measureElementContentSize(element: HTMLElement): {
  width: number
  height: number
} {
  const rect = element.getBoundingClientRect()
  const scrollWidth = element.scrollWidth
  const clientWidth = element.clientWidth

  return {
    width: Math.max(
      1,
      Math.ceil(Math.max(rect.width, scrollWidth, clientWidth))
    ),
    height: Math.max(1, Math.ceil(Math.max(rect.height, element.scrollHeight)))
  }
}

// Once signed in, the app shell wraps every visible surface, so all callers
// measure it. Measuring different nested elements made callers fight over the
// window size and caused visible jitter.
function resolveWindowSizeTarget(element: HTMLElement): HTMLElement {
  const appShell = document.querySelector(
    "[data-app-shell='true']"
  ) as HTMLElement | null

  return appShell || element
}

let pendingFrame: number | null = null
let pendingElement: HTMLElement | null = null
let pendingExtras = { width: 0, height: 0 }

// Coalesces every resize request made during a frame into one measurement and
// one IPC call, taken after layout has settled for that frame.
export function updateWindowToElement(
  element: HTMLElement,
  extras: {
    width?: number
    height?: number
  } = {}
): void {
  pendingElement = element
  pendingExtras = {
    width: Math.max(pendingExtras.width, extras.width ?? 0),
    height: Math.max(pendingExtras.height, extras.height ?? 0)
  }

  if (pendingFrame !== null) {
    return
  }

  pendingFrame = window.requestAnimationFrame(() => {
    pendingFrame = null
    const element = pendingElement
    const extras = pendingExtras
    pendingElement = null
    pendingExtras = { width: 0, height: 0 }

    if (!element?.isConnected) {
      return
    }

    const { width, height } = measureElementContentSize(
      resolveWindowSizeTarget(element)
    )

    window.electronAPI?.updateContentDimensions({
      width: width + 4 + extras.width,
      height: height + 4 + extras.height
    })
  })
}
