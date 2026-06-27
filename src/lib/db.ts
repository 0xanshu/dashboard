import { drizzle } from "drizzle-orm/node-postgres"
import { Client, Pool } from "pg"
import * as schema from "@/db/schema"

let client: Client | null = null

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
export const db = drizzle(pool, { schema })

export async function getDb() {
  if (!client) {
    client = new Client({ connectionString: process.env.DATABASE_URL })
    await client.connect()
  }
  return drizzle(client, { schema })
}
