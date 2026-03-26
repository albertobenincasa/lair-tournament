import { connectLambda, getStore } from "@netlify/blobs";

const STORE_NAME = "magic-lair-league";
const STATE_KEY = "league-state";

function json(statusCode, body) {
  return {
    statusCode,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  };
}

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return json(405, { error: "Method not allowed." });
  }

  try {
    connectLambda(event);
    const payload = JSON.parse(event.body ?? "{}");
    const state = payload?.state;
    if (!state || typeof state !== "object") {
      return json(400, { error: "Invalid state payload." });
    }

    const store = getStore(STORE_NAME);
    await store.setJSON(STATE_KEY, state);
    return json(200, { ok: true });
  } catch {
    return json(500, { error: "Unable to save shared state." });
  }
}
