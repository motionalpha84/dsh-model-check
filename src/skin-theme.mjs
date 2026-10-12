// Consume DSH's resolved active theme, including its system preference resolution.
export function resolveSkin(preference, snapshot) {
  if (preference !== 'follow') return ['original', 'light', 'dark'].includes(preference) ? preference : 'original';
  const active = snapshot?.active;
  if (active?.id === 'dsh-theme-firefly') return 'original';
  if (active?.colorScheme === 'dark') return 'dark';
  if (active?.colorScheme === 'light') return 'light';
  return 'original';
}
