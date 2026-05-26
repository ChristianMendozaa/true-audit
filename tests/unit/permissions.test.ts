import { describe, expect, it } from 'vitest';
import {
  canRoleEditAuditWork,
  canRoleManageMembers,
  canRoleRegisterResponse,
  canRoleReviewResponse,
  isCaseRole,
} from '@/lib/auth/permissions';

describe('permisos por rol', () => {
  it('permite trabajo auditor solo a roles del equipo auditor', () => {
    expect(canRoleEditAuditWork('auditor_lider')).toBe(true);
    expect(canRoleEditAuditWork('auditor')).toBe(true);
    expect(canRoleEditAuditWork('auditado')).toBe(false);
    expect(canRoleEditAuditWork('lector')).toBe(false);
    expect(canRoleEditAuditWork('demo')).toBe(false);
  });

  it('separa respuesta del auditado de revision del auditor', () => {
    expect(canRoleRegisterResponse('auditado')).toBe(true);
    expect(canRoleRegisterResponse('lector')).toBe(false);
    expect(canRoleReviewResponse('auditado')).toBe(false);
    expect(canRoleReviewResponse('auditor')).toBe(true);
  });

  it('distingue roles reales de expediente del rol demo sintetico', () => {
    expect(isCaseRole('auditor_lider')).toBe(true);
    expect(isCaseRole('lector')).toBe(true);
    expect(isCaseRole('demo')).toBe(false);
  });

  it('permite administrar miembros solo al auditor lider', () => {
    expect(canRoleManageMembers('auditor_lider')).toBe(true);
    expect(canRoleManageMembers('auditor')).toBe(false);
    expect(canRoleManageMembers('auditado')).toBe(false);
    expect(canRoleManageMembers('lector')).toBe(false);
  });
});
