import { afterEach, describe, expect, it, vi } from 'vitest';
import { GET } from '@/app/api/casos/[caseId]/governance/route';

describe('API de gobierno del expediente', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('devuelve 401 sin token cuando Auth real esta activo', async () => {
    vi.stubEnv('NEXT_PUBLIC_TRUE_AUDIT_AUTH_MODE', 'firebase');

    const response = await GET(
      new Request('http://localhost/api/casos/2026-014/governance'),
      { params: Promise.resolve({ caseId: '2026-014' }) },
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toMatchObject({ error: 'Autenticacion requerida.' });
  });
});
