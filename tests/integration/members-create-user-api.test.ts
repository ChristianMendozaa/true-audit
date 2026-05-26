import { afterEach, describe, expect, it, vi } from 'vitest';

const leader = {
  uid: 'UID-LEADER',
  email: 'lider@example.com',
  name: 'Lider',
  rol: 'auditor_lider',
  member: {
    uid: 'UID-LEADER',
    email: 'lider@example.com',
    nombre: 'Lider',
    rol: 'auditor_lider',
    activo: true,
  },
};

describe('API de creacion de usuarios del expediente', () => {
  afterEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.unstubAllEnvs();
    vi.doUnmock('@/lib/firebase/authz');
    vi.doUnmock('@/lib/firebase/admin');
    vi.doUnmock('@/lib/firebase/case-store');
  });

  it('valida contrasena temporal antes de crear usuario Auth', async () => {
    vi.stubEnv('NEXT_PUBLIC_TRUE_AUDIT_AUTH_MODE', 'firebase');
    vi.doMock('@/lib/firebase/authz', () => ({
      authorizeCaseRequest: vi.fn().mockResolvedValue(leader),
    }));
    vi.doMock('@/lib/firebase/admin', () => ({
      isFirebaseAdminConfigured: () => true,
      getFirebaseAdminAuth: () => ({
        createUser: vi.fn(),
      }),
    }));
    vi.doMock('@/lib/firebase/case-store', () => ({
      upsertCaseMemberInFirestore: vi.fn(),
    }));

    const { POST } = await import('@/app/api/casos/[caseId]/members/route');
    const response = await POST(
      new Request('http://localhost/api/casos/2026-014/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          createAuthUser: true,
          email: 'nuevo@example.com',
          password: '123',
          rol: 'auditor',
        }),
      }),
      { params: Promise.resolve({ caseId: '2026-014' }) },
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      error: 'La contrasena temporal debe tener al menos 6 caracteres.',
    });
  });

  it('crea usuario Auth y lo registra como miembro del expediente', async () => {
    const createUser = vi.fn().mockResolvedValue({
      uid: 'UID-NEW',
      email: 'nuevo@example.com',
      displayName: 'Nueva Auditora',
    });
    const upsertCaseMemberInFirestore = vi.fn().mockImplementation(async (_caseId, input) => input);

    vi.stubEnv('NEXT_PUBLIC_TRUE_AUDIT_AUTH_MODE', 'firebase');
    vi.doMock('@/lib/firebase/authz', () => ({
      authorizeCaseRequest: vi.fn().mockResolvedValue(leader),
    }));
    vi.doMock('@/lib/firebase/admin', () => ({
      isFirebaseAdminConfigured: () => true,
      getFirebaseAdminAuth: () => ({ createUser }),
    }));
    vi.doMock('@/lib/firebase/case-store', () => ({
      upsertCaseMemberInFirestore,
    }));

    const { POST } = await import('@/app/api/casos/[caseId]/members/route');
    const response = await POST(
      new Request('http://localhost/api/casos/2026-014/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          createAuthUser: true,
          email: 'nuevo@example.com',
          password: 'temporal123',
          nombre: 'Nueva Auditora',
          rol: 'auditor',
          organizacion: 'True Audit',
        }),
      }),
      { params: Promise.resolve({ caseId: '2026-014' }) },
    );

    expect(response.status).toBe(200);
    expect(createUser).toHaveBeenCalledWith({
      email: 'nuevo@example.com',
      password: 'temporal123',
      displayName: 'Nueva Auditora',
      disabled: false,
    });
    expect(upsertCaseMemberInFirestore).toHaveBeenCalledWith(
      '2026-014',
      expect.objectContaining({
        uid: 'UID-NEW',
        email: 'nuevo@example.com',
        nombre: 'Nueva Auditora',
        rol: 'auditor',
      }),
      expect.objectContaining({ uid: 'UID-LEADER', rol: 'auditor_lider' }),
      expect.objectContaining({ action: 'user.create' }),
    );
    await expect(response.json()).resolves.toMatchObject({
      ok: true,
      member: { uid: 'UID-NEW', rol: 'auditor' },
    });
  });
});
