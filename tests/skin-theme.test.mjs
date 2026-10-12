import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveSkin } from '../src/skin-theme.mjs';

test('manual skins remain pinned when the DSH theme changes', () => {
  for (const skin of ['original', 'light', 'dark']) {
    for (const colorScheme of ['light', 'dark']) assert.equal(resolveSkin(skin, { active:{ id:'custom', colorScheme } }), skin);
  }
});

test('follow uses the resolved light or dark theme when DSH follows the system', () => {
  for (const colorScheme of ['light', 'dark']) {
    assert.equal(resolveSkin('follow', { preference:'system', active:{ id:colorScheme, colorScheme } }), colorScheme);
  }
});

test('follow recognizes Firefly before falling back to its dark color scheme', () => {
  assert.equal(resolveSkin('follow', { preference:'dsh-theme-firefly', active:{ id:'dsh-theme-firefly', colorScheme:'dark' } }), 'original');
});

test('other registered themes follow their declared scheme rather than a name heuristic', () => {
  assert.equal(resolveSkin('follow', { active:{ id:'midnight-but-light', colorScheme:'light' } }), 'light');
  assert.equal(resolveSkin('follow', { active:{ id:'another-firefly-theme', colorScheme:'dark' } }), 'dark');
});

test('follow handles an unavailable snapshot without mutating the DSH theme', () => {
  assert.equal(resolveSkin('follow'), 'original');
  const snapshot = Object.freeze({ active:Object.freeze({ id:'dark', colorScheme:'dark' }) });
  assert.equal(resolveSkin('follow', snapshot), 'dark');
  assert.equal(resolveSkin('invalid', snapshot), 'original');
});
