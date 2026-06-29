import { useSession } from "@tanstack/react-start/server"
import { createServerFn } from "@tanstack/react-start"
import { createDashboardKey } from "./apiKeys"

type SessionType = Awaited<ReturnType<typeof useSession>>

if (!process.env.SESSION_PASSWORD) {
  throw new Error("SESSION_PASSWORD environment variable must be set")
}

export const sessionConfig = {
  password: process.env.SESSION_PASSWORD,
}

export async function getDashboardKey(
  project_id: string
): Promise<string | null> {
  try {
    const session = await useSession(sessionConfig)

    if (session.data.dashboard_keys?.[project_id]) {
      return session.data.dashboard_keys[project_id]
    } else {
      const result = await setDashboardKey(session, project_id)
      if (result.error) {
        throw new Error(result.error)
      }
      return session.data.dashboard_keys?.[project_id] || null
    }
  } catch (error) {
    console.error("Failed to get dashboard key session:", error)
    return null
  }
}

export async function setDashboardKey(
  session: SessionType,
  targetProjectId?: string
): Promise<{ error?: string }> {
  try {
    const existingKeys = Object.keys(session.data.dashboard_keys || {})
    const result = await createDashboardKey({ data: { existingKeys } })

    if (result.error) {
      console.error("Error creating dashboard keys globally:", result.error)
      if (targetProjectId) {
        return { error: result.error }
      }
      return {}
    }

    if (result.dashboardKeys && Object.keys(result.dashboardKeys).length > 0) {
      await session.update({
        ...session.data,
        dashboard_keys: {
          ...(session.data.dashboard_keys || {}),
          ...result.dashboardKeys,
        },
      })
    }

    if (targetProjectId && result.errors?.[targetProjectId]) {
      return { error: result.errors[targetProjectId] }
    }

    return {}
  } catch (error: any) {
    console.error("Failed to set dashboard keys:", error)
    return { error: error.message }
  }
}

export const clearDashboardSession = createServerFn({ method: "POST" }).handler(
  async () => {
    try {
      const session = await useSession(sessionConfig)
      await session.update({
        ...session.data,
        dashboard_keys: {},
      })
      return { success: true }
    } catch (error) {
      console.error("Failed to clear dashboard session:", error)
      return { error: "Failed to clear dashboard session" }
    }
  }
)
