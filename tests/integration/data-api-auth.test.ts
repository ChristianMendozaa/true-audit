import { afterEach, describe, expect, it, vi } from 'vitest';
import { PUT } from '@/app/api/casos/[caseId]/data/route';
import { caso2026014 } from '@/lib/mock-data';

describe('API de datos protegida por Auth', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('devuelve 401 cuando auth firebase esta activo y no llega token', async () => {
    vi.stubEnv('NEXT_PUBLIC_TRUE_AUDIT_AUTH_MODE', 'firebase');

    const response = await PUT(
      new Request('http://localhost/api/casos/2026-014/data', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caso: caso2026014 }),
      }),
      { params: Promise.resolve({ caseId: '2026-014' }) },
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toMatchObject({ error: 'Autenticacion requerida.' });
  });
});
