import { randomUUID } from "node:crypto"
import { store, type GuestChatStore } from "./store"
import {
  GUEST_TOKEN_PREFIX,
  type AuthSession,
  type UsageSnapshot,
  type UserDashboardData,
} from "../shared/backendAuth"
import type {
  AssistantChatMode,
  ChatThreadSummary,
  FollowUpRole,
  PersistedChatMessage,
} from "../shared/followUpChat"

// Guest mode runs entirely on this device: there is no backend account, usage
// is never capped, and chat history is kept in the local session store.

const GUEST_USER_ID = "guest"
const UNLIMITED = 999_999
const MAX_LISTED_THREADS = 40
const MAX_STORED_THREADS = 200

export function guestAccountOnlyError(feature: string): Error {
  return new Error(`${feature} needs a Sylica account. Sign in with email to use it.`)
}

export function createGuestSession(): AuthSession {
  const now = new Date().toISOString()
  return {
    token: `${GUEST_TOKEN_PREFIX}${randomUUID()}`,
    user: {
      id: GUEST_USER_ID,
      email: "",
      name: "Guest",
      role: "user",
      subscriptionPlan: "pro",
      subscriptionStatus: "active",
      subscriptionSource: "manual",
      cancelAtPeriodEnd: false,
      rateLimits: {
        solveDaily: UNLIMITED,
        debugDaily: UNLIMITED,
        requestsPerHour: UNLIMITED,
      },
      createdAt: now,
      updatedAt: now,
      lastLoginAt: now,
      subscriptionStartedAt: now,
      subscriptionRenewsAt: null,
    },
    usage: createUnlimitedUsage(),
  }
}

function createUnlimitedUsage(): UsageSnapshot {
  return {
    solvesToday: 0,
    debugToday: 0,
    screenshotsToday: 0,
    requestsToday: 0,
    requestsThisHour: 0,
    remainingRequestsToday: UNLIMITED,
    remainingSolveDaily: UNLIMITED,
    remainingDebugDaily: UNLIMITED,
    remainingRequestsThisHour: UNLIMITED,
    totalSolveCount: 0,
    totalDebugCount: 0,
    totalScreenshotCount: 0,
    blockedAttemptsToday: 0,
    lastUsageAt: null,
  }
}

export function buildGuestDashboard(session: AuthSession): UserDashboardData {
  return {
    user: session.user,
    usage: session.usage,
    billing: {
      provider: "manual",
      pricePerMonthUsd: 0,
      unlimited: true,
      checkoutEnabled: false,
      canManageBilling: false,
      cancelAtPeriodEnd: false,
      statusMessage: "Guest mode: unlimited access on this device.",
    },
    integrations: [],
    recentEvents: [],
    dailyActivity: [],
  }
}

// Mirrors summarizeChatTitle in backend/server.js.
function summarizeChatTitle(value: string): string {
  const normalized = String(value || "").replace(/\s+/g, " ").trim()
  if (!normalized) {
    return "New chat"
  }

  if (normalized.length <= 56) {
    return normalized
  }

  return `${normalized.slice(0, 53).trimEnd()}...`
}

function readGuestChat(): GuestChatStore {
  const chat = store.get("guestChat")
  return {
    threads: chat?.threads || [],
    messages: chat?.messages || [],
  }
}

function byMostRecent(a: ChatThreadSummary, b: ChatThreadSummary): number {
  return (b.lastMessageAt || "").localeCompare(a.lastMessageAt || "")
}

function findGuestThread(
  chat: GuestChatStore,
  threadId: string
): ChatThreadSummary {
  const thread = chat.threads.find((candidate) => candidate.id === threadId)
  if (!thread) {
    throw new Error("Chat thread not found.")
  }

  return thread
}

export function listGuestChatThreads(
  mode: AssistantChatMode
): ChatThreadSummary[] {
  return readGuestChat()
    .threads.filter((thread) => thread.mode === mode)
    .sort(byMostRecent)
    .slice(0, MAX_LISTED_THREADS)
}

export function createGuestChatThread(
  mode: AssistantChatMode,
  title?: string
): ChatThreadSummary {
  const now = new Date().toISOString()
  const thread: ChatThreadSummary = {
    id: randomUUID(),
    userId: GUEST_USER_ID,
    mode,
    title: summarizeChatTitle(title || ""),
    preview: "",
    createdAt: now,
    updatedAt: now,
    lastMessageAt: now,
  }

  const chat = readGuestChat()
  const threads = [thread, ...chat.threads].sort(byMostRecent)
  const keptThreads = threads.slice(0, MAX_STORED_THREADS)
  const keptThreadIds = new Set(keptThreads.map((candidate) => candidate.id))

  store.set("guestChat", {
    threads: keptThreads,
    messages: chat.messages.filter((message) => keptThreadIds.has(message.threadId)),
  })

  return thread
}

export function getGuestChatMessages(threadId: string): {
  thread: ChatThreadSummary
  messages: PersistedChatMessage[]
} {
  const chat = readGuestChat()
  return {
    thread: findGuestThread(chat, threadId),
    messages: chat.messages.filter((message) => message.threadId === threadId),
  }
}

export function appendGuestChatMessage(input: {
  threadId: string
  role: FollowUpRole
  content: string
}): { thread: ChatThreadSummary; message: PersistedChatMessage } {
  const chat = readGuestChat()
  const thread = findGuestThread(chat, input.threadId)
  const now = new Date().toISOString()

  const message: PersistedChatMessage = {
    id: randomUUID(),
    threadId: thread.id,
    userId: GUEST_USER_ID,
    role: input.role,
    content: input.content,
    createdAt: now,
  }

  const shouldRetitle =
    input.role === "user" && (!thread.title || thread.title === "New chat")
  const nextThread: ChatThreadSummary = {
    ...thread,
    title: shouldRetitle ? summarizeChatTitle(input.content) : thread.title,
    preview: input.content,
    updatedAt: now,
    lastMessageAt: now,
  }

  store.set("guestChat", {
    threads: chat.threads.map((candidate) =>
      candidate.id === thread.id ? nextThread : candidate
    ),
    messages: [...chat.messages, message],
  })

  return { thread: nextThread, message }
}
