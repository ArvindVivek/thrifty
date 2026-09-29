/**
 * The leaderboard client, against a fake Supabase client: reads, submits, the anonymous
 * session created only on submit, every database rejection mapped to plain English, and the
 * Supabase-down paths (not configured, network error, timeout) failing soft.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { AppClient } from '@/lib/kl/supabase/browser';
import {
  UNREACHABLE_MESSAGE,
  fetchLeaderboard,
  nameProblem,
  normalizeName,
  submitFailure,
  submitScore,
} from './leaderboard';

type Result = { data: unknown; error: unknown };

function fakeClient({
  rows = { data: [], error: null } as Result | Error,
  session = null as unknown,
  signIn = { data: {}, error: null } as Result,
  rpc = { data: 'new-id', error: null } as Result | Error,
} = {}) {
  const calls = { select: [] as unknown[], order: [] as unknown[], limit: [] as unknown[], rpc: [] as unknown[], signIn: 0, signals: [] as unknown[] };
  const settle = (value: Result | Error) => (value instanceof Error ? Promise.reject(value) : Promise.resolve(value));
  const query = {
    select(cols: string) {
      calls.select.push(cols);
      return query;
    },
    order(col: string, opts: unknown) {
      calls.order.push([col, opts]);
      return query;
    },
    limit(n: number) {
      calls.limit.push(n);
      return query;
    },
    abortSignal(signal: AbortSignal) {
      calls.signals.push(signal);
      return settle(rows);
    },
  };
  const client = {
    from: vi.fn(() => query),
    rpc: vi.fn((name: string, args: unknown) => {
      calls.rpc.push([name, args]);
      return {
        abortSignal: (signal: AbortSignal) => {
          calls.signals.push(signal);
          return settle(rpc);
        },
      };
    }),
    auth: {
      getSession: vi.fn(async () => ({ data: { session } })),
      signInAnonymously: vi.fn(async () => {
        calls.signIn++;
        return signIn;
      }),
    },
  };
  return { client: client as unknown as AppClient, calls, raw: client };
}

const good = { displayName: 'Penny', score: 12345, roundsCleared: 2, playMs: 41000 };

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('names', () => {
  it('trims and squashes spaces', () => {
    expect(normalizeName('  Big   Spender ')).toBe('Big Spender');
  });

  it.each(['Penny', 'A', 'Arvind V', 'x_y.z-9', 'ABCDEFGHIJKLMNO'])('accepts %s', (name) => {
    expect(nameProblem(name)).toBeNull();
  });

  it.each([
    ['', 'Type a name'],
    ['   ', 'Type a name'],
    ['ABCDEFGHIJKLMNOP', '15 characters'],
    ['-dash', 'letters and numbers'],
    ['dash-', 'letters and numbers'],
    ['two..dots', 'letters and numbers'],
    ['emoji 🙂', 'letters and numbers'],
    ['<script>', 'letters and numbers'],
  ])('rejects %j', (name, problem) => {
    expect(nameProblem(name)).toContain(problem);
  });
});

describe('fetchLeaderboard', () => {
  it('reads only the public columns, best first, earliest first on ties, with a timeout', async () => {
    const { client, calls } = fakeClient({
      rows: { data: [{ id: 'a', display_name: 'Penny', score: 900, created_at: '2026-09-29T20:00:00Z' }], error: null },
    });

    const result = await fetchLeaderboard(client, 50);

    expect(result).toEqual({
      ok: true,
      entries: [{ id: 'a', displayName: 'Penny', score: 900, createdAt: '2026-09-29T20:00:00Z' }],
    });
    expect(calls.select).toEqual(['id, display_name, score, created_at']);
    expect(calls.order).toEqual([
      ['score', { ascending: false }],
      ['created_at', { ascending: true }],
    ]);
    expect(calls.limit).toEqual([50]);
    expect(calls.signals[0]).toBeInstanceOf(AbortSignal);
  });

  it('returns an empty board as ok with no entries', async () => {
    const { client } = fakeClient({ rows: { data: [], error: null } });
    expect(await fetchLeaderboard(client)).toEqual({ ok: true, entries: [] });
  });

  it('fails soft when Supabase is not configured', async () => {
    expect(await fetchLeaderboard(null)).toEqual({ ok: false, message: UNREACHABLE_MESSAGE });
  });

  it('fails soft when the request errors (Supabase down)', async () => {
    const { client } = fakeClient({ rows: { data: null, error: { message: 'TypeError: Failed to fetch' } } });
    expect(await fetchLeaderboard(client)).toEqual({ ok: false, message: UNREACHABLE_MESSAGE });
  });

  it('fails soft when the request throws or times out', async () => {
    const { client } = fakeClient({ rows: new DOMException('The operation timed out.', 'TimeoutError') as unknown as Error });
    const result = await fetchLeaderboard(client);
    expect(result.ok).toBe(false);
    expect(console.error).toHaveBeenCalled();
  });
});

describe('submitScore', () => {
  it('signs in anonymously only when there is no session, then calls submit_score', async () => {
    const { client, calls } = fakeClient({ session: null });

    const result = await submitScore(good, client);

    expect(result).toEqual({ ok: true, id: 'new-id' });
    expect(calls.signIn).toBe(1);
    expect(calls.rpc).toEqual([
      ['submit_score', { p_display_name: 'Penny', p_score: 12345, p_rounds_cleared: 2, p_play_ms: 41000 }],
    ]);
  });

  it('reuses an existing session (no new anonymous user)', async () => {
    const { client, calls } = fakeClient({ session: { access_token: 't' } });
    await submitScore(good, client);
    expect(calls.signIn).toBe(0);
  });

  it('sends a clean name and whole numbers', async () => {
    const { client, calls } = fakeClient({ session: {} });
    await submitScore({ displayName: '  Big   Spender ', score: 99.6, roundsCleared: 1, playMs: 8000.4 }, client);
    expect(calls.rpc[0]).toEqual(['submit_score', { p_display_name: 'Big Spender', p_score: 100, p_rounds_cleared: 1, p_play_ms: 8000 }]);
  });

  it('never calls the server for a name the rules reject', async () => {
    const { client, calls, raw } = fakeClient();
    const result = await submitScore({ ...good, displayName: '--' }, client);
    expect(result).toMatchObject({ ok: false, reason: 'bad_name' });
    expect(raw.auth.getSession).not.toHaveBeenCalled();
    expect(calls.rpc).toHaveLength(0);
  });

  it.each([
    ['thrifty:bad_name', 'bad_name', "isn't allowed"],
    ['new row for relation "scores" violates check constraint "scores_display_name_charset"', 'bad_name', "isn't allowed"],
    ['thrifty:too_fast', 'too_fast', '10 seconds'],
    ['thrifty:daily_limit', 'daily_limit', '30 scores today'],
    ['thrifty:row_cap', 'row_cap', 'most scores'],
    ['thrifty:implausible_score', 'implausible', "couldn't be saved"],
    ['new row for relation "scores" violates check constraint "scores_score_range"', 'implausible', "couldn't be saved"],
    ['something unexpected', 'unreachable', 'Check your connection'],
  ])('maps "%s" to %s with a plain sentence', async (message, reason, sentence) => {
    const { client } = fakeClient({ session: {}, rpc: { data: null, error: { message, code: 'P0001' } } });
    const result = await submitScore(good, client);
    expect(result).toMatchObject({ ok: false, reason });
    if (!result.ok) {
      expect(result.message).toContain(sentence);
      expect(result.message).not.toContain('thrifty:');
    }
  });

  it('says "busy" when anonymous sign-ins are rate limited', async () => {
    const { client, calls } = fakeClient({ session: null, signIn: { data: null, error: { message: 'Request rate limit reached', status: 429 } } });
    const result = await submitScore(good, client);
    expect(result).toMatchObject({ ok: false, reason: 'busy' });
    expect(calls.rpc).toHaveLength(0);
  });

  it('fails soft when Supabase is down or not configured', async () => {
    const down = fakeClient({ session: {}, rpc: new TypeError('Failed to fetch') });
    expect(await submitScore(good, down.client)).toMatchObject({ ok: false, reason: 'unreachable' });
    expect(await submitScore(good, null)).toMatchObject({ ok: false, reason: 'unreachable' });
  });
});

describe('submitFailure', () => {
  it('treats unknown errors as unreachable', () => {
    expect(submitFailure(undefined)).toBe('unreachable');
    expect(submitFailure({ message: 'boom' })).toBe('unreachable');
  });
});
