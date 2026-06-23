import { createServerFn } from "@tanstack/react-start"
import { apiGet, apiPost, apiDelete, validator } from "./core"

export const listApiKeys = createServerFn({ method: "GET" }).handler(async () =>
  apiGet("/api/v1/api-keys")
)

export const createApiKey = createServerFn({ method: "POST" })
  .inputValidator(
    validator<{
      name: string
      role: "test" | "production"
      expiresIn: number
      webhookUrl: string
    }>()
  )
  .handler(async (ctx) => apiPost("/api/v1/api-keys", ctx.data))

export const revokeApiKey = createServerFn({ method: "POST" })
  .inputValidator(validator<{ id: string }>())
  .handler(async (ctx) => apiDelete(`/api/v1/api-keys/${ctx.data.id}`))
