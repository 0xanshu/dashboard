import { createServerFn } from "@tanstack/react-start"
import { validator } from "./core"
import { db } from "../db"
import { eq } from "drizzle-orm"
import { org, project } from "@/db/schema"
import { randomUUID } from "crypto"

const SCRAWN_HTTP_URL = process.env.SCRAWN_HTTP_URL || "http://localhost:8070"
const SCRAWN_KEY = process.env.SCRAWN_KEY as string
const MASTER_API_KEY = process.env.MASTER_API_KEY as string

export const getBackendConfig = createServerFn({ method: "GET" }).handler(
  async () => {
    const res = await fetch(`${SCRAWN_HTTP_URL}/api/v1/internals/config`, {
      headers: { Authorization: `Bearer ${SCRAWN_KEY}` },
    })
    if (!res.ok) return { configured: false }
    return res.json() as Promise<{
      configured: boolean
      dodo_live_product_id?: string
      dodo_test_product_id?: string
    }>
  }
)

export const submitOnboarding = createServerFn({ method: "POST" })
  .inputValidator(
    validator<{
      userId: string
      name: string
      dodoLiveApiKey: string
      dodoTestApiKey: string
      dodoLiveProductId: string
      dodoTestProductId: string
      currency: string
      redirectUrl: string
    }>()
  )
  .handler(async (ctx) => {
    let userOrg = await db.query.org.findFirst({
      where: eq(org.userId, ctx.data.userId),
    })

    if (!userOrg) {
      const newOrgId = randomUUID()
      const [newOrg] = await db
        .insert(org)
        .values({
          orgId: newOrgId,
          userId: ctx.data.userId,
        })
        .returning()
      userOrg = newOrg
    }

    const res = await fetch(`${SCRAWN_HTTP_URL}/api/v1/internals/onboarding`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${MASTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...ctx.data }),
    })

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      return { error: body.error || "Failed to save configuration" }
    }

    const data = await res.json().catch(() => ({}))

    const returnedProjectId = data.projectId

    if (!returnedProjectId) {
      return { error: "The project id is undefined" }
    }

    await db.insert(project).values({
      projectId: returnedProjectId,
      orgId: userOrg.orgId,
    })
    return { success: true }
  })
