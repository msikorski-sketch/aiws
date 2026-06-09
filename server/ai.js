// Claude-powered enrichment: per-article TL;DR and a daily digest.
// Degrades gracefully to a no-op when ANTHROPIC_API_KEY is not set.
import Anthropic from '@anthropic-ai/sdk';

const MODEL = process.env.AI_MODEL || 'claude-opus-4-8';
const hasKey = !!process.env.ANTHROPIC_API_KEY;
const client = hasKey ? new Anthropic() : null;

export const aiEnabled = hasKey;
export const aiModel = MODEL;

// JSON schema for the per-article summary (structured outputs).
const SUMMARY_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    tldr: {
      type: 'string',
      description: 'A 1-2 sentence plain summary of what is new and why it matters, for an AI practitioner.',
    },
    why_it_matters: {
      type: 'string',
      description: 'One short clause on the practical significance for someone working with AI.',
    },
  },
  required: ['tldr', 'why_it_matters'],
};

const summaryCache = new Map(); // id -> {tldr, why_it_matters}

export async function summarizePost(post) {
  if (!client) return null;
  if (summaryCache.has(post.id)) return summaryCache.get(post.id);

  const input = `Title: ${post.title}\nSource: ${post.source}\nExcerpt: ${post.snippet || '(none)'}`;
  try {
    const res = await client.messages.parse({
      model: MODEL,
      max_tokens: 400,
      thinking: { type: 'disabled' },
      output_config: { format: { type: 'json_schema', schema: SUMMARY_SCHEMA }, effort: 'low' },
      system:
        'Streszczasz wiadomości o AI/ML dla zapracowanych praktyków. Pisz PO POLSKU, ' +
        'konkretnie i neutralnie, bez marketingu i przesady. Jeśli fragment jest ubogi, ' +
        'streść na podstawie samego tytułu. Pola tldr i why_it_matters wypełnij po polsku.',
      messages: [{ role: 'user', content: input }],
    });
    const out = res.parsed_output;
    if (out) summaryCache.set(post.id, out);
    return out;
  } catch (err) {
    console.warn(`[ai] summary failed: ${err.message}`);
    return null;
  }
}

let digestCache = { at: 0, text: '' };
const DIGEST_TTL = 30 * 60 * 1000;

export async function buildDigest(topPosts) {
  if (!client) return null;
  if (Date.now() - digestCache.at < DIGEST_TTL && digestCache.text) return digestCache.text;

  const list = topPosts
    .slice(0, 12)
    .map((p, i) => `${i + 1}. [${p.sourceCategory || 'News'}] ${p.title} (${p.source})${p.snippet ? ' — ' + p.snippet.slice(0, 160) : ''}`)
    .join('\n');

  try {
    const stream = client.messages.stream({
      model: MODEL,
      max_tokens: 1200,
      thinking: { type: 'disabled' },
      output_config: { effort: 'low' },
      system:
        'Jesteś redaktorem piszącym zwięzły dzienny briefing o AI dla praktyków. PISZ PO POLSKU. ' +
        'Na podstawie listy dzisiejszych najważniejszych historii o AI napisz krótki przegląd w Markdown: ' +
        'jedno zdanie wstępu, potem 4-6 punktów grupujących powiązane tematy — każdy punkt to jedno zdanie ' +
        'o tym, co się stało i dlaczego to ważne. Zakończ jedną linią „Warto się przyjrzeć:" z wyróżnioną pozycją. ' +
        'Bądź neutralny i konkretny. Nie wymyślaj faktów spoza listy.',
      messages: [{ role: 'user', content: `Dzisiejsze najważniejsze historie o AI:\n\n${list}` }],
    });
    const msg = await stream.finalMessage();
    const text = msg.content.filter((b) => b.type === 'text').map((b) => b.text).join('').trim();
    digestCache = { at: Date.now(), text };
    return text;
  } catch (err) {
    console.warn(`[ai] digest failed: ${err.message}`);
    return null;
  }
}

// Explain an arXiv paper in plain Polish, based on title + abstract.
export async function explainPaper({ title, abstract }) {
  if (!client) return null;
  try {
    const stream = client.messages.stream({
      model: MODEL,
      max_tokens: 700,
      thinking: { type: 'disabled' },
      output_config: { effort: 'low' },
      system:
        'Wyjaśniasz prace naukowe z dziedziny AI/ML dla inżyniera, który nie jest specjalistą w danym poddziale. ' +
        'PISZ PO POLSKU. Krótko (4-6 zdań): (1) co autorzy proponują, (2) dlaczego to ważne i co poprawia, ' +
        '(3) jak działa w skrócie, (4) ograniczenia. Bez „wody" i bez powtarzania samego tytułu. ' +
        'Jeśli abstrakt jest ubogi, napisz wprost, że tyle wiadomo z abstraktu.',
      messages: [{ role: 'user', content: `Tytuł: ${title}\n\nAbstrakt:\n${abstract}` }],
    });
    const msg = await stream.finalMessage();
    return msg.content.filter((b) => b.type === 'text').map((b) => b.text).join('').trim();
  } catch (err) {
    console.warn(`[ai] explain failed: ${err.message}`);
    return null;
  }
}

// RAG: answer a question grounded in the provided context posts, citing [n].
export async function answerQuestion(question, contexts) {
  if (!client) return null;
  const ctx = contexts
    .map((c, i) => `[${i + 1}] ${c.title} (${c.source})\n${c.snippet || ''}`)
    .join('\n\n');
  try {
    const stream = client.messages.stream({
      model: MODEL,
      max_tokens: 900,
      thinking: { type: 'disabled' },
      output_config: { effort: 'low' },
      system:
        'Odpowiadasz na pytania o najnowsze wydarzenia w AI WYŁĄCZNIE na podstawie podanych ' +
        'fragmentów źródeł. PISZ PO POLSKU, zwięźle i konkretnie. Po każdym zdaniu lub twierdzeniu ' +
        'dodaj cytowanie w formacie [n] wskazujące numer źródła. Jeśli w materiałach nie ma ' +
        'odpowiedzi, napisz wprost, że źródła z dzisiejszego feedu tego nie pokrywają. ' +
        'Nie wymyślaj faktów spoza fragmentów.',
      messages: [{ role: 'user', content: `Pytanie: ${question}\n\nFragmenty źródeł:\n${ctx}` }],
    });
    const msg = await stream.finalMessage();
    return msg.content.filter((b) => b.type === 'text').map((b) => b.text).join('').trim();
  } catch (err) {
    console.warn(`[ai] ask failed: ${err.message}`);
    return null;
  }
}
