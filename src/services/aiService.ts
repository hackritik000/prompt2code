import { Item, AiConfig, AiResponse } from '../types';

/**
 * AI Comparison Service (TypeScript Edition)
 *
 * Integrates optional Large Language Model (Gemini / OpenAI-compatible) verification
 * to provide a second-opinion semantic comparison between two reports.
 */

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

export interface AiError extends Error {
  status?: number;
  kind?: string;
}

const createError = (msg: string, extra: Partial<AiError> = {}): AiError =>
  Object.assign(new Error(msg), extra);

/**
 * Compares a lost report and a found report using the configured AI provider.
 */
export async function compareWithAI(
  lost: Item,
  found: Item,
  config: AiConfig,
  onProgress?: (message: string) => void
): Promise<AiResponse> {
  const isGemini = config.provider === 'gemini';

  if (!isGemini && !config.model) {
    throw createError('No model configured', { kind: 'model' });
  }

  const formatItem = (item: Item): string =>
    `${item.color} ${item.category}, ${item.description || 'no description'}, at ${item.location} on ${item.date}`;

  const prompt =
    'You compare two campus lost-and-found reports. Reply with JSON only: ' +
    '{"score": number 0-100 (chance they are the same item), "reason": "one short sentence"}.\n' +
    `LOST: ${formatItem(lost)}\nFOUND: ${formatItem(found)}`;

  const url = isGemini
    ? `https://generativelanguage.googleapis.com/v1beta/models/${config.model || 'gemini-3.5-flash'}:generateContent`
    : `${(config.base || 'https://api.openai.com/v1').replace(/\/$/, '')}/chat/completions`;

  const requestOptions: RequestInit = {
    method: 'POST',
    headers: isGemini
      ? { 'Content-Type': 'application/json', 'x-goog-api-key': config.key || '' }
      : {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${config.key || ''}`,
        },
    body: JSON.stringify(
      isGemini
        ? { contents: [{ parts: [{ text: prompt }] }] }
        : {
            model: config.model,
            messages: [{ role: 'user', content: prompt }],
          }
    ),
  };

  let response: Response | undefined;
  const maxAttempts = 3;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      response = await fetch(url, {
        ...requestOptions,
        signal:
          typeof AbortSignal !== 'undefined' && 'timeout' in AbortSignal
            ? AbortSignal.timeout(20000)
            : undefined,
      });
    } catch {
      throw createError('Network error', { kind: 'net' });
    }

    const isTransientError = [429, 500, 502, 503, 504].includes(response.status);

    if (response.ok || !isTransientError || attempt === maxAttempts) {
      break;
    }

    if (onProgress) {
      onProgress('The AI service is busy, trying again...');
    }
    await sleep(1500 * attempt);
  }

  if (!response || !response.ok) {
    throw createError(`HTTP ${response?.status}`, { status: response?.status });
  }

  try {
    const json = await response.json();
    const rawText = isGemini
      ? json.candidates[0].content.parts.map((p: { text?: string }) => p.text || '').join('')
      : json.choices[0].message.content;

    const matchedJson = rawText.match(/\{[\s\S]*\}/);
    if (!matchedJson) {
      throw new Error('No JSON found in response');
    }

    return JSON.parse(matchedJson[0]) as AiResponse;
  } catch {
    throw createError('Invalid AI reply format', { kind: 'reply' });
  }
}

/**
 * Translates AI request errors into clear, actionable user messages.
 */
export function getAiErrorMessage(err: unknown): string {
  const aiErr = err as AiError | undefined;
  const status = aiErr?.status;
  let reason = 'The AI replied in an unexpected format. Please try again.';

  if (status && (status >= 500 || status === 429)) {
    reason = 'The AI service is busy right now. Press Ask AI again in a moment.';
  } else if (status === 404) {
    reason = 'The model name was not found. Check the model name in AI settings.';
  } else if (status) {
    reason =
      'The key was rejected or the request was invalid. Check the API key in AI settings.';
  } else if (aiErr?.kind === 'model') {
    reason = 'Add a model name in AI settings.';
  } else if (aiErr?.kind === 'net') {
    reason = 'Could not reach the AI service (no internet, or it took too long).';
  }

  return `${reason}${status ? ` (HTTP ${status})` : ''} Matching still works offline.`;
}
