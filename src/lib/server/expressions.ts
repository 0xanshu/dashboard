import { createServerFn } from "@tanstack/react-start"
import { apiGet, apiPost, apiDelete, validator } from "./core"

export const listExpressions = createServerFn({ method: "GET" }).handler(
  async () => apiGet("/api/v1/expressions")
)

export const createExpression = createServerFn({ method: "POST" })
  .inputValidator(validator<{ key: string; expr: string }>())
  .handler(async (ctx) => apiPost("/api/v1/expressions", ctx.data))

export const deleteExpression = createServerFn({ method: "POST" })
  .inputValidator(validator<{ key: string }>())
  .handler(async (ctx) => apiDelete(`/api/v1/expressions/${ctx.data.key}`))
