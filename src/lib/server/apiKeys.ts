import { createServerFn } from "@tanstack/react-start"
import { apiGet, apiPost, apiDelete, validator } from "./core"
import { getRequest } from "@tanstack/react-start/server"
import { auth } from "../auth"
import { db } from "../db"
import { org, project } from "@/db/schema"
import { eq } from "drizzle-orm"

const SCRAWN_HTTP_URL = process.env.SCRAWN_HTTP_URL || "http://localhost:8070"

if (!process.env.MASTER_API_KEY) {
  throw new Error("Master API Key is not set")
}
const MASTER_API_KEY = process.env.MASTER_API_KEY as string

export const listApiKeys = createServerFn({ method: "GET" })
  .inputValidator(validator<{ projectId: string }>())
  .handler(async (ctx) => apiGet(ctx.data.projectId, "/api/v1/api-keys"))

export const createApiKey = createServerFn({ method: "POST" })
  .inputValidator(
    validator<{
      projectId: string
      name: string
      role: "test" | "production"
      expiresIn: number
      webhookUrl: string
    }>()
  )
  .handler(async (ctx) => {
    const { projectId, ...payload } = ctx.data
    return apiPost(projectId, "/api/v1/api-keys", payload)
  })

export const revokeApiKey = createServerFn({ method: "POST" })
  .inputValidator(validator<{ projectId: string; id: string }>())
  .handler(async (ctx) =>
    apiDelete(ctx.data.projectId, `/api/v1/api-keys/${ctx.data.id}`)
  )

export const createDashboardKey = createServerFn({
  method: "POST",
})
  .inputValidator(validator<{}>())
  .handler(async (ctx) => {
    const request = getRequest()
    const session = await auth.api.getSession({
      headers: request?.headers,
    })

    if (!session) {
      return { error: "Unauthorized" }
    }

    const userId = session.user.id

    let userOrg = await db.query.org.findFirst({
      where: eq(org.userId, userId),
    })

    if (!userOrg) {
      return { error: "User is not under any org" }
    }

    const allProjects = await db.query.project.findMany({
      where: eq(project.orgId, userOrg.orgId),
    })

    if (allProjects.length === 0) {
      return { error: "No projects found under this org" }
    }

    const fetchPromises = allProjects.map(async (p) => {
      try {
        const res = await fetch(
          `${SCRAWN_HTTP_URL}/api/v1/create-dashboard-key/${p.projectId}`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${MASTER_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ ...ctx.data }),
          }
        )

        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          throw new Error(
            body.error || `Failed to create key for project ${p.projectId}`
          )
        }

        const data = await res.json().catch(() => ({}))

        if (!data.projectId || !data.apiKey) {
          throw new Error(`Invalid response for project ${p.projectId}`)
        }

        return {
          projectId: data.projectId as string,
          dashboardKey: data.apiKey as string,
        }
      } catch (err) {
        console.error(err)
        return null
      }
    })

    try {
      const results = await Promise.all(fetchPromises)

      const dashboardKeys: Record<string, string> = {}
      for (const result of results) {
        if (result) dashboardKeys[result.projectId] = result.dashboardKey
      }

      return { dashboardKeys }
    } catch (error: any) {
      return {
        error:
          error.message || "An error occurred while creating dashboard keys",
      }
    }
  })
