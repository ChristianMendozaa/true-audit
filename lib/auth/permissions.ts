import type { RolCaso, RolUsuario } from '@/lib/types';

export const AUDIT_EDIT_ROLES: RolUsuario[] = ['auditor_lider', 'auditor'];
export const RESPONSE_ROLES: RolUsuario[] = ['auditor_lider', 'auditor', 'auditado'];

export function canRoleEditAuditWork(rol: RolUsuario | null | undefined) {
  return Boolean(rol && AUDIT_EDIT_ROLES.includes(rol));
}

export function canRoleRegisterResponse(rol: RolUsuario | null | undefined) {
  return Boolean(rol && RESPONSE_ROLES.includes(rol));
}

export function canRoleReviewResponse(rol: RolUsuario | null | undefined) {
  return rol === 'auditor_lider' || rol === 'auditor';
}

export function canRoleManageMembers(rol: RolUsuario | null | undefined) {
  return rol === 'auditor_lider';
}

export function isCaseRole(rol: string | null | undefined): rol is RolCaso {
  return rol === 'auditor_lider' || rol === 'auditor' || rol === 'auditado' || rol === 'lector';
}

export function roleLabel(rol: RolUsuario | null | undefined) {
  switch (rol) {
    case 'auditor_lider':
      return 'Auditor lider';
    case 'auditor':
      return 'Auditor';
    case 'auditado':
      return 'Auditado';
    case 'lector':
      return 'Lector';
    case 'demo':
      return 'Demo';
    default:
      return 'Sin rol';
  }
}
