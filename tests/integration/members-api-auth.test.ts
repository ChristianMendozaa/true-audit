import { afterEach, describe, expect, it, vi } from 'vitest';
import { POST } from '@/app/api/casos/[caseId]/members/route';
import { DELETE } from '@/app/api/casos/[caseId]/members/[uid]/route';

describe('API de miembros del expediente', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('requiere token para agregar miembros', async () => {
    vi.stubEnv('NEXT_PUBLIC_TRUE_AUDIT_AUTH_MODE', 'firebase');

    const response = await POST(
      new Request('http://localhost/api/casos/2026-014/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'auditor@example.com', rol: 'auditor' }),
      }),
      { params: Promise.resolve({ caseId: '2026-014' }) },
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toMatchObject({ error: 'Autenticacion requerida.' });
  });

  it('requiere token para desactivar miembros', async () => {
    vi.stubEnv('NEXT_PUBLIC_TRUE_AUDIT_AUTH_MODE', 'firebase');

    const response = await DELETE(
      new Request('http://localhost/api/casos/2026-014/members/USR-1', { method: 'DELETE' }),
      { params: Promise.resolve({ caseId: '2026-014', uid: 'USR-1' }) },
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toMatchObject({ error: 'Autenticacion requerida.' });
  });
});
