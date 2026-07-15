/**
 * Thin helpers for poking game docs directly over the Firestore REST API
 * (the project's rules are intentionally open). Used to shorten the answer
 * timers so timeout tests don't run at party pace, and to inspect docs.
 */
const DOCS =
  "https://firestore.googleapis.com/v1/projects/loddy-e37f1/databases/(default)/documents/games";

export function gameIdFromUrl(url: string): string {
  return new URL(url).pathname.split("/")[2];
}

export async function patchGameNumbers(
  id: string,
  fields: Record<string, number>,
) {
  const mask = Object.keys(fields)
    .map((k) => `updateMask.fieldPaths=${k}`)
    .join("&");
  const body = {
    fields: Object.fromEntries(
      Object.entries(fields).map(([k, v]) => [k, { integerValue: String(v) }]),
    ),
  };
  const res = await fetch(`${DOCS}/${id}?${mask}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`firestore patch failed: ${res.status} ${await res.text()}`);
  }
}

export async function getGameDoc(id: string): Promise<any> {
  const res = await fetch(`${DOCS}/${id}`);
  if (!res.ok) {
    throw new Error(`firestore get failed: ${res.status}`);
  }
  return res.json();
}
