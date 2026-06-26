import { createServerFn } from "@tanstack/react-start"
import { getRequest } from "@tanstack/react-start/server"
import { auth } from "../auth"
import { db } from "../db"
import { org, project } from "@/db/schema"
import { eq } from "drizzle-orm"

export const listProjects = createServerFn({ method: "GET" }).handler(
  async () => {
    const request = getRequest()
    const session = await auth.api.getSession({
      headers: request?.headers,
    })

    if (!session) return []

    const userOrg = await db.query.org.findFirst({
      where: eq(org.userId, session.user.id),
    })

    if (!userOrg) return []

    const projects = await db.query.project.findMany({
      where: eq(project.orgId, userOrg.orgId),
    })

    return projects.map((p) => p.projectId)
  }
)
