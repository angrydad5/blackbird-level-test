import "server-only";

const KIT_API_BASE = "https://api.kit.com/v4";

function headers() {
  return {
    "Content-Type": "application/json",
    "X-Kit-Api-Key": process.env.KIT_API_KEY!,
  };
}

export type SubscriberFields = {
  score?: number;
  band_label?: string;
  cefr?: string;
  opic?: string;
  missed_summary?: string;
  results_url?: string;
};

async function upsertSubscriber(email: string, fields?: SubscriberFields) {
  console.log("[convertkit] upsertSubscriber:", email, "fields:", fields);
  const res = await fetch(`${KIT_API_BASE}/subscribers`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ email_address: email, state: "active", fields }),
  });
  const text = await res.text();
  console.log("[convertkit] upsertSubscriber response:", res.status, text);
  if (!res.ok) throw new Error(`upsertSubscriber failed: ${res.status} ${text}`);
}

async function findTagIdByName(name: string): Promise<string | null> {
  let cursor: string | undefined;
  do {
    const url = new URL(`${KIT_API_BASE}/tags`);
    url.searchParams.set("per_page", "500");
    if (cursor) url.searchParams.set("after", cursor);

    const res = await fetch(url, { headers: headers() });
    const text = await res.text();
    if (!res.ok) {
      console.log("[convertkit] listTags response:", res.status, text);
      throw new Error(`listTags failed: ${res.status} ${text}`);
    }
    const data = JSON.parse(text);

    const match = (data.tags ?? []).find(
      (t: { id: string; name: string }) => t.name.toLowerCase() === name.toLowerCase(),
    );
    if (match) {
      console.log("[convertkit] found existing tag:", name, "->", match.id);
      return match.id;
    }

    cursor = data.pagination?.has_next_page ? data.pagination.end_cursor : undefined;
  } while (cursor);

  console.log("[convertkit] no existing tag found for:", name);
  return null;
}

async function createTag(name: string): Promise<string> {
  console.log("[convertkit] createTag:", name);
  const res = await fetch(`${KIT_API_BASE}/tags`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ name }),
  });
  const text = await res.text();
  console.log("[convertkit] createTag response:", res.status, text);
  if (!res.ok) throw new Error(`createTag failed: ${res.status} ${text}`);
  const data = JSON.parse(text);
  return data.tag.id;
}

async function getOrCreateTagId(name: string): Promise<string> {
  const existing = await findTagIdByName(name);
  if (existing) return existing;
  return createTag(name);
}

async function tagSubscriber(email: string, tagId: string) {
  console.log("[convertkit] tagSubscriber:", email, "tagId:", tagId);
  const res = await fetch(`${KIT_API_BASE}/tags/${tagId}/subscribers`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ email_address: email }),
  });
  const text = await res.text();
  console.log("[convertkit] tagSubscriber response:", res.status, text);
  if (!res.ok) throw new Error(`tagSubscriber failed: ${res.status} ${text}`);
}

export async function applyConvertKitTags(
  email: string,
  tagNames: string[],
  fields?: SubscriberFields,
) {
  console.log("[convertkit] applyConvertKitTags start:", email, tagNames);
  await upsertSubscriber(email, fields);
  for (const name of tagNames) {
    const tagId = await getOrCreateTagId(name);
    await tagSubscriber(email, tagId);
  }
  console.log("[convertkit] applyConvertKitTags done:", email);
}
