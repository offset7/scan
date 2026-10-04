import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const here = path.dirname(fileURLToPath(import.meta.url));
const migrationDir = path.resolve(here, '../../database/init');

test('database init migrations do not drop columns or tables', () => {
  for (const filename of fs.readdirSync(migrationDir).filter((name) => name.endsWith('.sql'))) {
    const sql = fs.readFileSync(path.join(migrationDir, filename), 'utf8');
    assert.doesNotMatch(sql, /\bDROP\s+(?:COLUMN|TABLE)\b/i, `${filename} must remain forward-only`);
  }
});

test('DeepSeek generation storage permits only the Codex harness', () => {
  const sql = fs.readFileSync(path.join(migrationDir, '033_generations_deepseek_codex.sql'), 'utf8');

  assert.match(sql, /model_provider IN \([^)]*'deepseek'[^)]*\)/);
  assert.match(sql, /model_provider = 'deepseek' AND harness = 'codex'/);
  assert.doesNotMatch(sql, /model_provider = 'deepseek' AND harness = '(?:claude-code|grok-build)'/);
});

test('Z.ai generation storage permits only the Claude Code harness', () => {
  const sql = fs.readFileSync(path.join(migrationDir, '034_generations_zai_claude_code.sql'), 'utf8');

  assert.match(sql, /model_provider IN \([^)]*'zai'[^)]*\)/);
  assert.match(sql, /model_provider = 'zai' AND harness = 'claude-code'/);
  assert.doesNotMatch(sql, /model_provider = 'zai' AND harness = '(?:codex|grok-build)'/);
  assert.match(sql, /model_provider = 'deepseek' AND harness = 'codex'/);
});
