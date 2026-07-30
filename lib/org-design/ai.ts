import type { AiPatch, DesignGraph } from '@/lib/org-design/types';

const apiKey = process.env.OPENAI_API_KEY || process.env.AI_INTEGRATIONS_OPENAI_API_KEY;
const baseURL = process.env.OPENAI_BASE_URL || process.env.AI_INTEGRATIONS_OPENAI_BASE_URL;

export const aiAvailable = Boolean(apiKey);

const MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

function snapshotToContext(data: DesignGraph) {
  return JSON.stringify({
    entities: data.entities.map((e) => ({
      id: e.id,
      name: e.name,
      type: e.type,
      purpose: e.purpose,
      domain: e.domain,
      parentId: e.parentId,
      accountabilities: e.accountabilities,
      ddatRoleId: e.ddatRoleId,
    })),
    relationships: data.relationships.map((r) => ({
      id: r.id,
      sourceId: r.sourceId,
      targetId: r.targetId,
      type: r.type,
    })),
    people: (data.people ?? []).map((p) => ({
      id: p.id,
      name: p.name,
      skills: p.skills,
    })),
    assignments: (data.assignments ?? []).map((a) => ({
      id: a.id,
      personId: a.personId,
      entityId: a.entityId,
    })),
  });
}

const SYSTEM_PROMPT = `You are an expert organizational designer helping UK public-sector teams redesign digital service organisations for GDS Service Standard readiness.
Entities have type: "circle" (group), "role" (individual responsibility), or "product".
Relationship types: "includes", "reports-to", "collaborates-with".
Prefer multidisciplinary GDS roles (Service Owner, Product Manager, Delivery Manager, User Researcher, Service Designer, Content Designer, Performance Analyst, developers).
Be concise and practical.`;

async function chatCompletion(messages: Array<{ role: string; content: string }>): Promise<string> {
  if (!apiKey) throw new Error('AI is not configured');
  const url = `${(baseURL || 'https://api.openai.com/v1').replace(/\/$/, '')}/chat/completions`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      response_format: { type: 'json_object' },
      messages,
      max_tokens: 2000,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`AI request failed: ${res.status} ${text.slice(0, 200)}`);
  }
  const json = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  return json.choices?.[0]?.message?.content || '{}';
}

export async function chatWithOrg(opts: {
  message: string;
  history: Array<{ role: 'user' | 'assistant'; content: string }>;
  context: DesignGraph;
}): Promise<{ reply: string; proposedPatch: AiPatch | null }> {
  const orgJson = snapshotToContext(opts.context);
  const text = await chatCompletion([
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'system', content: `Current organization (JSON):\n${orgJson}` },
    {
      role: 'system',
      content: `Always respond in strict JSON:
{"reply":"...","proposedPatch":null OR {"summary":"...","entities":[...],"relationships":[...],"updates":[...]}}
Patch entity: {tempId,name,type,purpose?,domain?,accountabilities?,parentTempId?,ddatRoleId?}.
Patch relationship: {sourceTempId,targetTempId,type}.
Patch update: {id,name?,purpose?,domain?,accountabilities?}.`,
    },
    ...opts.history.map((m) => ({ role: m.role, content: m.content })),
    { role: 'user', content: opts.message },
  ]);
  try {
    const parsed = JSON.parse(text) as {
      reply?: string;
      proposedPatch?: AiPatch | null;
    };
    const reply = typeof parsed.reply === 'string' ? parsed.reply : '';
    let proposedPatch: AiPatch | null = null;
    if (parsed.proposedPatch && Array.isArray(parsed.proposedPatch.entities)) {
      proposedPatch = parsed.proposedPatch;
    }
    return { reply, proposedPatch };
  } catch {
    return { reply: text, proposedPatch: null };
  }
}

export async function generateOrgFromPrompt(prompt: string): Promise<AiPatch> {
  const text = await chatCompletion([
    { role: 'system', content: SYSTEM_PROMPT },
    {
      role: 'system',
      content: `Return JSON AiPatch: {"summary":"...","entities":[...],"relationships":[...],"updates":[]}. Prefer GDS multidisciplinary roles with ddatRoleId when known.`,
    },
    { role: 'user', content: prompt },
  ]);
  const parsed = JSON.parse(text) as AiPatch;
  if (!Array.isArray(parsed.entities)) throw new Error('Invalid AI generate response');
  return {
    summary: parsed.summary,
    entities: parsed.entities,
    relationships: parsed.relationships ?? [],
    updates: parsed.updates ?? [],
  };
}

export async function suggestAccountabilities(opts: {
  entityName: string;
  entityType: string;
  purpose?: string | null;
  domain?: string | null;
}): Promise<string[]> {
  const text = await chatCompletion([
    { role: 'system', content: SYSTEM_PROMPT },
    {
      role: 'system',
      content: 'Return JSON {"accountabilities":["..."]} — 3 to 6 short accountabilities.',
    },
    {
      role: 'user',
      content: JSON.stringify(opts),
    },
  ]);
  const parsed = JSON.parse(text) as { accountabilities?: string[] };
  return Array.isArray(parsed.accountabilities) ? parsed.accountabilities : [];
}

export async function refinePurpose(opts: {
  entityName: string;
  entityType: string;
  purpose?: string | null;
  domain?: string | null;
}): Promise<string> {
  const text = await chatCompletion([
    { role: 'system', content: SYSTEM_PROMPT },
    {
      role: 'system',
      content: 'Return JSON {"purpose":"..."} — one clear purpose sentence.',
    },
    { role: 'user', content: JSON.stringify(opts) },
  ]);
  const parsed = JSON.parse(text) as { purpose?: string };
  return typeof parsed.purpose === 'string' ? parsed.purpose : opts.purpose || '';
}

export async function findOverlaps(opts: {
  entity: { id: string; name: string; accountabilities: string[] };
  others: Array<{ id: string; name: string; accountabilities: string[] }>;
}): Promise<Array<{ otherEntityId: string; otherEntityName: string; overlap: string[] }>> {
  const text = await chatCompletion([
    { role: 'system', content: SYSTEM_PROMPT },
    {
      role: 'system',
      content:
        'Return JSON {"overlaps":[{"otherEntityId":"...","otherEntityName":"...","overlap":["..."]}]}',
    },
    { role: 'user', content: JSON.stringify(opts) },
  ]);
  try {
    const parsed = JSON.parse(text) as {
      overlaps?: Array<{ otherEntityId: string; otherEntityName: string; overlap: string[] }>;
    };
    return Array.isArray(parsed.overlaps) ? parsed.overlaps : [];
  } catch {
    return [];
  }
}
