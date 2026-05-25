/**
 * Heuristic extraction of scored questions from tender PDF plain text.
 * Advisory import only; human review required before submission.
 */

export interface ParsedTenderQuestion {
  ref: string;
  text: string;
  weight: number;
  category: string;
  isPassFail: boolean;
  confidence: 'high' | 'medium' | 'low';
}

const QUESTION_HEAD =
  /^(?:question\s*)?([A-Z]?\d{1,2}[a-z]?|[A-Z]{1,2}\d{0,2})\s*[.:)\-–]\s*(.+)$/i;

const PASS_FAIL_HINT = /\b(pass\s*\/?\s*fail|mandatory|minimum\s+score|threshold)\b/i;

export function parseTenderPdfText(raw: string): ParsedTenderQuestion[] {
  const lines = raw
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((l) => l.replace(/\s+/g, ' ').trim())
    .filter(Boolean);

  const questions: ParsedTenderQuestion[] = [];
  let current: ParsedTenderQuestion | null = null;

  for (const line of lines) {
    const head = line.match(QUESTION_HEAD);
    if (head) {
      if (current && current.text.length > 20) questions.push(current);
      const ref = head[1].toUpperCase();
      const text = head[2].trim();
      current = {
        ref,
        text,
        weight: 1,
        category: inferCategory(text),
        isPassFail: PASS_FAIL_HINT.test(text),
        confidence: text.length > 40 ? 'high' : 'medium',
      };
      continue;
    }

    if (current && line.length > 10 && !looksLikePageFooter(line)) {
      current.text = `${current.text} ${line}`.trim().slice(0, 4000);
      if (PASS_FAIL_HINT.test(line)) current.isPassFail = true;
    }
  }

  if (current && current.text.length > 20) questions.push(current);

  if (questions.length === 0) {
    return fallbackChunkParser(raw);
  }

  return dedupeByRef(questions);
}

function inferCategory(text: string): string {
  const lower = text.toLowerCase();
  if (/\b(price|cost|commercial|fee)\b/.test(lower)) return 'commercial';
  if (/\b(sustainab|social value|carbon|wellbeing|welsh)\b/.test(lower)) return 'social_value';
  if (/\b(technical|method|approach|deliver)\b/.test(lower)) return 'capability';
  return 'capability';
}

function looksLikePageFooter(line: string): boolean {
  return /^\d+\s*$/.test(line) || /^page\s+\d+/i.test(line);
}

function fallbackChunkParser(raw: string): ParsedTenderQuestion[] {
  const blocks = raw
    .split(/\n{2,}/)
    .map((b) => b.replace(/\s+/g, ' ').trim())
    .filter((b) => b.length > 80 && b.length < 3000);

  return blocks.slice(0, 25).map((text, i) => ({
    ref: `P${i + 1}`,
    text,
    weight: 1,
    category: inferCategory(text),
    isPassFail: PASS_FAIL_HINT.test(text),
    confidence: 'low' as const,
  }));
}

function dedupeByRef(questions: ParsedTenderQuestion[]): ParsedTenderQuestion[] {
  const seen = new Set<string>();
  return questions.filter((q) => {
    const key = q.ref;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export async function extractTextFromPdfBuffer(buffer: Buffer): Promise<string> {
  const mod = await import('pdf-parse');
  const pdfParse =
    typeof mod === 'function'
      ? mod
      : 'default' in mod && typeof mod.default === 'function'
        ? mod.default
        : mod;
  const result = await (pdfParse as (data: Buffer) => Promise<{ text?: string }>)(buffer);
  return result.text ?? '';
}
