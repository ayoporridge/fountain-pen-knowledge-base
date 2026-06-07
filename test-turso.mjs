import { createClient } from "@libsql/client";

const TURSO_URL = "libsql://fpkg-arjoxu.aws-us-west-2.turso.io";
const TURSO_TOKEN = "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3ODA4MDg2NzcsImlkIjoiMDE5ZWEwNWQtZGMwMS03ZDZmLTgzMTQtNjhkNzllNTE1ZTcwIiwicmlkIjoiZDE3Mjk1YWItN2JlNi00ZTYwLTg3M2QtODU4ODMyY2VhMGI2In0.vGKA-x1oyP-DMwLwTJK6aXICOVoy6vQpc22_jJzmjuysugNaJJnqTJ22sWmomhrWgNUXqn68UY8OWmj9nFiBCw";

async function main() {
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
