import { createClient } from "@libsql/client";

const TURSO_URL = process.env.TURSO_DATABASE_URL;
const TURSO_TOKEN = process.env.TURSO_AUTH_TOKEN;

async function main() {
  if (!TURSO_URL || !TURSO_TOKEN) {
    throw new Error("Set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN first.");
  }

  console.log("Testing connection to:", TURSO_URL);

  const client = createClient({
    url: TURSO_URL,
    authToken: TURSO_TOKEN,
  });

  try {
    const result = await client.execute("SELECT 1 as test");
    console.log("Success:", result.rows);
  } catch (error) {
    console.error("Error:", error.message);
    console.error("Full error:", error);
  }
}

main();
