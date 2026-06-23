import { createServerFn } from "@tanstack/react-start"
import { apiGet, apiPost, apiDelete, validator } from "./core"

export const listTags = createServerFn({ method: "GET" }).handler(async () =>
  apiGet("/api/v1/tags")
)

export const createTag = createServerFn({ method: "POST" })
  .inputValidator(validator<{ key: string; amount: number }>())
  .handler(async (ctx) => apiPost("/api/v1/tags", ctx.data))

export const deleteTag = createServerFn({ method: "POST" })
  .inputValidator(validator<{ key: string }>())
  .handler(async (ctx) => apiDelete(`/api/v1/tags/${ctx.data.key}`))
