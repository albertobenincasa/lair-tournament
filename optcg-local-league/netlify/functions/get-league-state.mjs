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
  try {
    connectLambda(event);
    const store = getStore(STORE_NAME);
    const state = await store.get(STATE_KEY, { type: "json" });
    return json(200, { state: state ?? null });
  } catch {
    return json(500, { error: "Unable to read shared state." });
  }
}
