import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

// Execute the real callbacks without contacting Google or a database.
const source = readFileSync(new URL('../auth.config.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
});
const configExports = {};
vm.runInNewContext(outputText, {
  exports: configExports,
  process: { env: {} },
  require(name) {
    if (name === './lib/config') return { isGoogleEnabled: () => true };
    if (name === 'next-auth/providers/google' || name === 'next-auth/providers/credentials') {
      return { default: () => ({}) };
    }
    throw new Error(`Unexpected dependency: ${name}`);
  },
});
const callbacks = configExports.authConfig.callbacks;

test('Google sign-in keeps account credentials out of the session token', async () => {
  const token = await callbacks.jwt({
    token: {}, user: { id: 'person-fixture', email: 'person@example.test' },
    account: { provider: 'google', access_token: 'calendar-access-fixture', refresh_token: 'calendar-refresh-fixture' },
  });
  assert.equal(token.sub, 'person-fixture');
  assert.equal(token.email, 'person@example.test');
  assert.equal('accessToken' in token, false);
  assert.equal('refreshToken' in token, false);
  assert.equal('provider' in token, false);
});

test('an existing token loses credentials when the session is read again', async () => {
  const token = await callbacks.jwt({ token: {
    sub: 'person-fixture', email: 'person@example.test',
    accessToken: 'old-access-fixture', refreshToken: 'old-refresh-fixture', provider: 'google',
  } });
  assert.equal(token.sub, 'person-fixture');
  assert.equal('accessToken' in token, false);
  assert.equal('refreshToken' in token, false);
  assert.equal('provider' in token, false);
});

test('the browser session returns identity and expiry without account credentials', async () => {
  const session = await callbacks.session({
    session: { user: { name: 'Person' }, expires: '2030-01-01T00:00:00.000Z',
      accessToken: 'stale-access-fixture', refreshToken: 'stale-refresh-fixture', provider: 'google' },
    token: { sub: 'person-fixture', email: 'person@example.test',
      accessToken: 'calendar-access-fixture', refreshToken: 'calendar-refresh-fixture', provider: 'google' },
  });
  assert.deepEqual(Object.keys(session).sort(), ['expires', 'user']);
  assert.equal(session.user.id, 'person-fixture');
  assert.equal(session.user.email, 'person@example.test');
  assert.equal(session.user.name, 'Person');
  assert.equal(session.expires, '2030-01-01T00:00:00.000Z');
});
