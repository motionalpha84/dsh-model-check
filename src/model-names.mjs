// Display names only. Keep the original IDs for requests, matching and stored results.
// Self-contained so both client builds can embed exactly the same formatter.
export function displayModel(value) {
  const names = {
    'gpt-5.4': 'GPT-5.4',
    'gpt-5.5': 'GPT-5.5',
    'gpt-5.6-sol': 'GPT-5.6 Sol',
    'gpt-5.6-terra': 'GPT-5.6 Terra',
    'gpt-5.6-luna': 'GPT-5.6 Luna',
    'gpt-6-astra': 'GPT-6 Astra',
    'gpt-6-sol': 'GPT-6 Sol',
    'gpt-6-luna': 'GPT-6 Luna',
    'gpt-6.1-sol': 'GPT-6.1 Sol',
    'claude-haiku-4-5': 'Claude-Haiku 4.5',
    'claude-haiku-4-5-20251001': 'Claude-Haiku 4.5',
    'claude-haiku-5-5': 'Claude-Haiku 5.5',
    'claude-sonnet-4-6': 'Claude-Sonnet 4.6',
    'claude-sonnet-5': 'Claude-Sonnet 5',
    'claude-sonnet-5-5': 'Claude-Sonnet 5.5',
    'claude-opus-4-6': 'Claude-Opus 4.6',
    'claude-opus-4-7': 'Claude-Opus 4.7',
    'claude-opus-4-8': 'Claude-Opus 4.8',
    'claude-opus-5': 'Claude-Opus 5',
    'claude-opus-5-5': 'Claude-Opus 5.5',
  };
  const name = typeof value === 'string' ? value : '—';
  const start = name.lastIndexOf('/') + 1;
  const id = name.slice(start).toLowerCase()
    .replace(/^(claude-(?:haiku|sonnet|opus))-(\d+)\.(\d+)$/, '$1-$2-$3');
  return Object.hasOwn(names, id) ? name.slice(0, start) + names[id] : name;
}
