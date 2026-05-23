'use strict';

const DEFAULT_MODEL = 'llama-3.3-70b-versatile';
const FAST_MODEL = 'llama-3.1-8b-instant';
const MAX_RETRIES = 3;

const SYSTEM_PROMPT = `You are an expert in Perchance.org generator syntax. Generate valid, working Perchance generators.

PERCHANCE SYNTAX RULES:
1. A generator is made of named lists. Each list name is on its own line, entries are indented 2 spaces.
2. The first list is always "output" — shown when generating.
3. Reference other lists with [listName].
4. Inline choices: {a|b|c}. Random numbers: {1-10}.
5. Import another generator: [^gen-name.listName].
6. Weights: add number after entry space ("rare item  1", "common item  5").
7. Newlines in output: \\n. HTML formatting allowed.
8. Comments start with //
9. Use \\s when you need a leading or trailing space in generated text.

OUTPUT ONLY raw Perchance code. No markdown fences, no explanations. Always start with the output list.`;

const REVERSE_PROMPT = `You are an expert in Perchance.org generator syntax. Your task is to REVERSE-ENGINEER a Perchance generator by analyzing sample outputs provided by the user.

OUTPUT ONLY raw Perchance code. No markdown fences, no explanations.`;

let _groqClient = null;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isGroqConfigured() {
  return Boolean(process.env.GROQ_API_KEY);
}

function getGroqClient() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null;
  if (_groqClient) return _groqClient;
  try {
    const Groq = require('groq-sdk');
    _groqClient = new Groq({ apiKey });
    return _groqClient;
  } catch {
    return null;
  }
}

function cleanCode(raw) {
  return raw.replace(/^```[a-z]*\n?/gm, '').replace(/^```$/gm, '').trim();
}

function getErrorStatus(err) {
  return err?.status || err?.error?.status || err?.response?.status || 500;
}

function mapGroqError(err) {
  const status = getErrorStatus(err);
  if (status === 429) {
    return { status: 429, message: 'Rate limit reached. Please wait a moment and try again.' };
  }
  if (status === 401 || status === 403) {
    return { status: 503, message: 'GROQ_API_KEY invalid or missing. Set it in your .env file.' };
  }
  return { status: 500, message: err?.message || 'Unexpected Groq API error' };
}

async function callGroq(messages, maxTokens = 2048, model = DEFAULT_MODEL) {
  const groq = getGroqClient();
  if (!groq) {
    const err = new Error('GROQ_API_KEY not configured');
    err.status = 503;
    throw err;
  }

  let lastError;
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const completion = await groq.chat.completions.create({
        model,
        messages,
        temperature: 0.8,
        max_tokens: maxTokens,
        top_p: 0.9
      });
      return completion.choices[0]?.message?.content?.trim() || '';
    } catch (err) {
      lastError = err;
      const status = getErrorStatus(err);
      const retryable = status === 429 || status >= 500;
      if (retryable && attempt < MAX_RETRIES - 1) {
        const delay = Math.pow(2, attempt) * 500 + Math.random() * 200;
        await sleep(delay);
        continue;
      }
      throw err;
    }
  }
  throw lastError;
}

module.exports = {
  SYSTEM_PROMPT,
  REVERSE_PROMPT,
  DEFAULT_MODEL,
  FAST_MODEL,
  isGroqConfigured,
  getGroqClient,
  cleanCode,
  callGroq,
  mapGroqError,
  getErrorStatus // exported for tests
};
