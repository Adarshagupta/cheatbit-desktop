import { useEffect, useRef, useState, type FormEvent } from "react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { updateWindowToElement } from "../../utils/contentSize"
import type { AuthState } from "../../../shared/backendAuth"
import { CheatbitMark } from "../Brand/CheatbitMark"

interface AuthScreenProps {
  initialError?: string
  onAuthenticated: (state: AuthState) => void
}

type AuthMode = "login" | "register"

export function AuthScreen({
  initialError,
  onAuthenticated,
}: AuthScreenProps) {
  const [mode, setMode] = useState<AuthMode>("login")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState(initialError || "")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setError(initialError || "")
  }, [initialError])

  useEffect(() => {
    if (!containerRef.current) return

    const updateDimensions = () => {
      if (!containerRef.current) return
      updateWindowToElement(containerRef.current, { width: 28, height: 28 })
    }

    updateDimensions()

    const resizeObserver = new ResizeObserver(updateDimensions)
    resizeObserver.observe(containerRef.current)

    return () => resizeObserver.disconnect()
  }, [])

  const runAuth = async (authenticate: () => Promise<AuthState>) => {
    setIsSubmitting(true)
    setError("")

    try {
      onAuthenticated(await authenticate())
    } catch (submitError) {
      const message =
        submitError instanceof Error
          ? submitError.message
          : "Authentication failed."
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    void runAuth(() =>
      mode === "login"
        ? window.electronAPI.login({ email, password })
        : window.electronAPI.register({ name, email, password })
    )
  }

  const handleGuestLogin = () => {
    void runAuth(() => window.electronAPI.loginAsGuest())
  }

  return (
    <div
      ref={containerRef}
      data-size-root="true"
      className="inline-flex items-center justify-center bg-transparent p-4"
    >
      <div className="w-[340px] rounded-[24px] border border-white/10 bg-black/85 p-5 shadow-2xl shadow-black/40">
        <div className="mb-5 flex items-center gap-3">
          <CheatbitMark className="h-9 w-9 rounded-[14px]" />
          <h1 className="text-xl font-semibold tracking-[-0.03em] text-white">
            Sylica AI
          </h1>
        </div>

        <div className="mb-4 flex gap-2 rounded-full border border-white/10 bg-white/5 p-1">
          <button
            type="button"
            className={`flex-1 rounded-full px-3 py-2 text-sm transition-colors ${
              mode === "login"
                ? "bg-white text-black"
                : "text-white/70 hover:text-white"
            }`}
            onClick={() => setMode("login")}
          >
            Login
          </button>
          <button
            type="button"
            className={`flex-1 rounded-full px-3 py-2 text-sm transition-colors ${
              mode === "register"
                ? "bg-white text-black"
                : "text-white/70 hover:text-white"
            }`}
            onClick={() => setMode("register")}
          >
            Register
          </button>
        </div>

        <form className="space-y-3" onSubmit={handleSubmit}>
          {mode === "register" && (
            <Input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Name"
              aria-label="Name"
              className="h-11 rounded-2xl border-white/10 bg-white/5 text-white placeholder:text-white/35"
            />
          )}

          <Input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Email"
            aria-label="Email"
            className="h-11 rounded-2xl border-white/10 bg-white/5 text-white placeholder:text-white/35"
          />

          <Input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Password"
            aria-label="Password"
            className="h-11 rounded-2xl border-white/10 bg-white/5 text-white placeholder:text-white/35"
          />

          {error ? (
            <div className="rounded-2xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          ) : null}

          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-11 w-full rounded-2xl bg-white text-black hover:bg-white/90"
          >
            {isSubmitting
              ? "Please wait..."
              : mode === "login"
              ? "Login"
              : "Register"}
          </Button>
        </form>

        <div className="my-3 flex items-center gap-3 text-xs text-white/35">
          <div className="h-px flex-1 bg-white/10" />
          or
          <div className="h-px flex-1 bg-white/10" />
        </div>

        <Button
          type="button"
          disabled={isSubmitting}
          onClick={handleGuestLogin}
          className="h-11 w-full rounded-2xl border border-white/15 bg-transparent text-white hover:bg-white/10"
        >
          Continue as guest
        </Button>
      </div>
    </div>
  )
}
