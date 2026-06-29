import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useState, useEffect } from "react"
import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { checkUsersExist, createAdminUser } from "@/lib/scrawn-server"
import { clearDashboardSession } from "@/lib/server/cache"
import { Eye, EyeOff, Lock, Mail, User, ShieldAlert, ArrowRight } from "lucide-react"
import { ThemeToggle } from "@/components/ThemeToggle"

export const Route = createFileRoute("/sign-in")({
  head: () => ({
    meta: [
      {
        title: "Sign In — Scrawn Developer Billing Console",
      },
      {
        name: "description",
        content: "Log in to your Scrawn console to manage developer api keys, monitor metered billing events, configure live webhooks, and scale your AI token pricing.",
      },
      {
        name: "og:title",
        content: "Sign In — Scrawn Developer Billing Console",
      },
      {
        name: "og:description",
        content: "Log in to your Scrawn console to manage developer api keys, monitor metered billing events, configure live webhooks, and scale your AI token pricing.",
      },
      {
        name: "og:image",
        content: "/og.jpg",
      },
      {
        name: "twitter:title",
        content: "Sign In — Scrawn Developer Billing Console",
      },
      {
        name: "twitter:description",
        content: "Log in to your Scrawn console to manage developer api keys, monitor metered billing events, configure live webhooks, and scale your AI token pricing.",
      },
      {
        name: "twitter:image",
        content: "/og.jpg",
      },
    ],
  }),
  component: SignIn,
})

function SignIn() {
  const navigate = useNavigate()
  const { data: session } = authClient.useSession()
  const [mode, setMode] = useState<"loading" | "sign-in" | "setup">("loading")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    checkUsersExist()
      .then((res) => {
        setMode(res.exists ? "sign-in" : "setup")
      })
      .catch((err) => {
        console.error("checkUsersExist failed:", err)
        setError(err instanceof Error ? err.message : String(err))
        setMode("sign-in")
      })
  }, [])

  useEffect(() => {
    if (session) {
      navigate({ to: "/dashboard", replace: true })
    }
  }, [session, navigate])
  if (mode === "loading") return null

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      await clearDashboardSession()
    } catch (err) {
      console.error("Failed to clear dashboard session", err)
    }

    const { error: signInError } = await authClient.signIn.email({
      email,
      password,
    })
    if (signInError) {
      setError(signInError.message || signInError.code || "Invalid credentials")
      setLoading(false)
    }
  }

  async function handleSetup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      await clearDashboardSession()
    } catch (err) {
      console.error("Failed to clear dashboard session", err)
    }

    const res = await createAdminUser({ data: { name, email, password } })
    if (res.error) {
      setError(res.error)
      setLoading(false)
      return
    }
    const { error: signInError } = await authClient.signIn.email({
      email,
      password,
    })
    if (signInError) {
      setError(signInError.message || "Account created but sign-in failed")
      setLoading(false)
      return
    }
  }

  return (
    <div className="relative flex min-h-svh flex-col justify-between overflow-x-hidden bg-white text-black selection:bg-yellow-400 selection:text-black dark:bg-black dark:text-white dark:selection:bg-yellow-400 dark:selection:text-black">
      {/* Background blueprint grid overlay */}
      <div className="pointer-events-none absolute inset-0 z-0 bg-[url('/potentialbackground.png')] bg-[length:1000px_auto] bg-top opacity-[0.03] md:bg-cover md:bg-center md:bg-no-repeat dark:opacity-[0.06] dark:invert" />

      <header className="relative z-20 flex w-full items-center justify-between border-b border-neutral-200 bg-white/80 px-6 py-4 backdrop-blur-md dark:border-neutral-800 dark:bg-black/80">
        <a href="https://www.scrawn.dev/" className="flex items-center gap-3 group">
          <div className="border border-black bg-white p-1.5 transition-transform group-hover:rotate-[-6deg] dark:border-white dark:bg-black">
            <img
              src="/Scrawn_Logo.png"
              alt="Scrawn Logo"
              className="h-5 w-5 object-contain"
            />
          </div>
          <span className="font-mono text-lg font-black uppercase tracking-tighter text-black dark:text-white">
            SCRAWN
          </span>
        </a>

        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </header>

      {/* Main split-screen container */}
      <main className="relative z-10 mx-auto flex w-full max-w-[1400px] flex-1 flex-col items-center justify-center gap-12 px-6 py-12 lg:flex-row lg:items-stretch lg:justify-between">
        
        {/* Left Column: Visual schematic & Portal titles */}
        <div className="flex w-full flex-col justify-center items-start lg:w-[50%]">
          <div className="mb-4 inline-flex border-2 border-black bg-yellow-400 px-3 py-1 font-mono text-xs font-black uppercase tracking-widest text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] rotate-[-1deg] dark:border-white dark:bg-yellow-500">
            {mode === "setup" ? "// INITIAL CONFIGURATION" : "// SECURE CONSOLE ACCESS"}
          </div>

          <h1 className="text-5xl font-mono font-black uppercase leading-[0.9] tracking-tighter text-black dark:text-white sm:text-6xl xl:text-7xl">
            {mode === "setup" ? (
              <>
                INITIALIZE <br />
                YOUR BILLING <br />
                <span className="text-[#ff00ff]">CONSOLE.</span>
              </>
            ) : (
              <>
                SIGN IN <br />
                TO THE <br />
                <span className="text-[#ff00ff]">DASHBOARD.</span>
              </>
            )}
          </h1>

          <p className="mt-4 font-mono text-sm leading-relaxed text-neutral-600 dark:text-neutral-400 max-w-md">
            {mode === "setup"
              ? "Setup the primary system administrator account to initialize database schema models, metering analytics, and gateway keys."
              : "Access the central control desk to configure api keys, monitor webhook outputs, and inspect live usage analytics."
            }
          </p>
        </div>

        {/* Right Column: Setup / SignIn Form Card */}
        <div className="relative flex w-full max-w-md flex-col justify-center items-center lg:w-[45%]">
          {/* Stacked background offset card */}
          <div className="absolute -right-3 bottom-3 left-3 top-3 border-2 border-black bg-neutral-100 dark:border-white dark:bg-neutral-900" />
          
          {/* Foreground Form Card */}
          <div className="relative z-10 w-full border-2 border-black bg-white p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:border-white dark:bg-black dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
            
            {mode === "setup" ? (
              <form onSubmit={handleSetup} className="flex flex-col gap-6">
                <div className="flex flex-col gap-1 border-b border-neutral-100 dark:border-neutral-800 pb-4">
                  <h2 className="font-mono text-xl font-black tracking-wide text-black uppercase dark:text-white">
                    Setup Admin Account
                  </h2>
                  <p className="font-mono text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                    Create the primary administrator credentials.
                  </p>
                </div>

                {/* Input Fields */}
                <div className="flex flex-col gap-4">
                  {/* Name Input */}
                  <div className="flex flex-col gap-1.5">
                    <label className="font-mono text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
                      Admin Name
                    </label>
                    <div className="relative flex items-center">
                      <User className="absolute left-3 h-4 w-4 text-neutral-400 pointer-events-none" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Satoshi"
                        required
                        className="w-full border-2 border-black bg-white dark:bg-black dark:border-white pl-10 pr-4 py-2.5 text-sm font-mono text-black dark:text-white transition-all outline-none focus:bg-yellow-50/10 dark:focus:bg-zinc-950 focus:translate-x-[1px] focus:translate-y-[1px]"
                      />
                    </div>
                  </div>

                  {/* Email Input */}
                  <div className="flex flex-col gap-1.5">
                    <label className="font-mono text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
                      Email Address
                    </label>
                    <div className="relative flex items-center">
                      <Mail className="absolute left-3 h-4 w-4 text-neutral-400 pointer-events-none" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="satoshi@scrawn.dev"
                        required
                        className="w-full border-2 border-black bg-white dark:bg-black dark:border-white pl-10 pr-4 py-2.5 text-sm font-mono text-black dark:text-white transition-all outline-none focus:bg-yellow-50/10 dark:focus:bg-zinc-950 focus:translate-x-[1px] focus:translate-y-[1px]"
                      />
                    </div>
                  </div>

                  {/* Password Input */}
                  <div className="flex flex-col gap-1.5">
                    <label className="font-mono text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
                      Password
                    </label>
                    <div className="relative flex items-center">
                      <Lock className="absolute left-3 h-4 w-4 text-neutral-400 pointer-events-none" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        required
                        minLength={8}
                        className="w-full border-2 border-black bg-white dark:bg-black dark:border-white pl-10 pr-10 py-2.5 text-sm font-mono text-black dark:text-white transition-all outline-none focus:bg-yellow-50/10 dark:focus:bg-zinc-950 focus:translate-x-[1px] focus:translate-y-[1px]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 text-neutral-400 hover:text-black dark:hover:text-white cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="border border-red-500 bg-red-50 dark:bg-red-950/20 p-3 flex gap-2.5 items-start">
                    <ShieldAlert className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                    <span className="font-mono text-xs font-bold text-red-600 dark:text-red-400">
                      Error: {error}
                    </span>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  variant="fuchsia"
                  className="mt-2 h-12 text-sm font-mono font-black tracking-widest uppercase border-2 border-black dark:border-white flex gap-2 items-center justify-center cursor-pointer"
                >
                  {loading ? "Initializing..." : "Initialize System"}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </form>
            ) : (
              <form onSubmit={handleSignIn} className="flex flex-col gap-6">
                <div className="flex flex-col gap-1 border-b border-neutral-100 dark:border-neutral-800 pb-4">
                  <h2 className="font-mono text-xl font-black tracking-wide text-black uppercase dark:text-white">
                    Sign In
                  </h2>
                  <p className="font-mono text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                    Enter your credentials to enter the console dashboard.
                  </p>
                </div>

                {/* Input Fields */}
                <div className="flex flex-col gap-4">
                  {/* Email Input */}
                  <div className="flex flex-col gap-1.5">
                    <label className="font-mono text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
                      Email Address
                    </label>
                    <div className="relative flex items-center">
                      <Mail className="absolute left-3 h-4 w-4 text-neutral-400 pointer-events-none" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="satoshi@scrawn.dev"
                        required
                        className="w-full border-2 border-black bg-white dark:bg-black dark:border-white pl-10 pr-4 py-2.5 text-sm font-mono text-black dark:text-white transition-all outline-none focus:bg-yellow-50/10 dark:focus:bg-zinc-950 focus:translate-x-[1px] focus:translate-y-[1px]"
                      />
                    </div>
                  </div>

                  {/* Password Input */}
                  <div className="flex flex-col gap-1.5">
                    <label className="font-mono text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
                      Password
                    </label>
                    <div className="relative flex items-center">
                      <Lock className="absolute left-3 h-4 w-4 text-neutral-400 pointer-events-none" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        required
                        className="w-full border-2 border-black bg-white dark:bg-black dark:border-white pl-10 pr-10 py-2.5 text-sm font-mono text-black dark:text-white transition-all outline-none focus:bg-yellow-50/10 dark:focus:bg-zinc-950 focus:translate-x-[1px] focus:translate-y-[1px]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 text-neutral-400 hover:text-black dark:hover:text-white cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="border border-red-500 bg-red-50 dark:bg-red-950/20 p-3 flex gap-2.5 items-start">
                    <ShieldAlert className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                    <span className="font-mono text-xs font-bold text-red-600 dark:text-red-400">
                      Error: {error}
                    </span>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  variant="fuchsia"
                  className="mt-2 h-12 text-sm font-mono font-black tracking-widest uppercase border-2 border-black dark:border-white flex gap-2 items-center justify-center cursor-pointer"
                >
                  {loading ? "Connecting..." : "Enter Control Room"}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </form>
            )}

          </div>
        </div>
      </main>

      {/* Static Footer */}
      <footer className="relative z-20 border-t border-neutral-100 bg-white py-6 dark:border-neutral-900 dark:bg-black">
        <div className="mx-auto flex max-w-md justify-center gap-6 font-mono text-xs text-neutral-500 uppercase tracking-widest">
          <a href="https://docs.scrawn.dev" target="_blank" rel="noreferrer" className="hover:underline">
            Docs
          </a>
          <span>•</span>
          <a href="https://github.com/ScrawnDotDev/scrawn" target="_blank" rel="noreferrer" className="hover:underline">
            GitHub
          </a>
          <span>•</span>
          <a href="https://www.scrawn.dev/" className="hover:underline">
            Home
          </a>
        </div>
      </footer>
    </div>
  )
}
