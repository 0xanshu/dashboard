import { useSession } from "@tanstack/react-start/server"
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
      const allDashboardKeys = await setDashboardKey(session)
      return allDashboardKeys[project_id] || null
    }
  } catch (error) {
    console.error("Failed to get dashboard key session:", error)
    return null
  }
}

export async function setDashboardKey(
  session: SessionType
): Promise<Record<string, string>> {
  try {
    const result = await createDashboardKey()

    if (result.error || !result.dashboardKeys) {
      console.error("Error creating dashboard keys:", result.error)
      return {}
    }

    await session.update({
      ...session.data,
      dashboard_keys: result.dashboardKeys,
    })

    return result.dashboardKeys
  } catch (error) {
    console.error("Failed to set dashboard keys:", error)
    return {}
  }
}
