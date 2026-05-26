'use client';

import { useCallback, useEffect, useState } from 'react';
import { roleLabel } from '@/lib/auth/permissions';
import type { AuditLogEntry, MiembroCaso, RolCaso } from '@/lib/types';
import { useAuth } from '@/components/auth/AuthProvider';
import { useCaseData } from '@/components/data/CaseDataProvider';

interface GovernanceResponse {
  members: MiembroCaso[];
  auditLog: AuditLogEntry[];
}

function formatDate(value?: string) {
  if (!value) return 'sin fecha';
  return new Intl.DateTimeFormat('es-BO', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value));
}

export default function CaseGovernancePanel({ caseId }: { caseId: string }) {
  const { caso, syncStatus, syncMessage } = useCaseData();
  const { authMode, isAuthenticated, idToken, usuario, rol, refreshIdToken, canManageMembers } = useAuth();
  const [members, setMembers] = useState<MiembroCaso[]>([]);
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [memberDraft, setMemberDraft] = useState<MemberDraft>(() => emptyMemberDraft());
  const [editingUid, setEditingUid] = useState<string | null>(null);
  const [savingMember, setSavingMember] = useState(false);
  const [memberMessage, setMemberMessage] = useState<string | null>(null);

  const loadGovernance = useCallback(async () => {
    if (authMode !== 'firebase' || !isAuthenticated) return;

    setLoading(true);
    setError(null);
    try {
      const token = idToken ?? await refreshIdToken();
      const response = await fetch(`/api/casos/${caseId}/governance`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        cache: 'no-store',
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const body = await response.json() as GovernanceResponse;
      setMembers(body.members ?? []);
      setAuditLog(body.auditLog ?? []);
    } catch {
      setError('No se pudo cargar la bitacora de gobierno.');
    } finally {
      setLoading(false);
    }
  }, [authMode, caseId, idToken, isAuthenticated, refreshIdToken]);

  useEffect(() => {
    queueMicrotask(() => {
      void loadGovernance();
    });
  }, [loadGovernance]);

  const saveMember = async () => {
    if (!canManageMembers) return;
    setSavingMember(true);
    setError(null);
    setMemberMessage(null);
    try {
      const token = idToken ?? await refreshIdToken();
      const url = editingUid
        ? `/api/casos/${caseId}/members/${editingUid}`
        : `/api/casos/${caseId}/members`;
      const response = await fetch(url, {
        method: editingUid ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          uid: memberDraft.uid.trim() || undefined,
          email: memberDraft.email.trim() || undefined,
          nombre: memberDraft.nombre.trim() || undefined,
          rol: memberDraft.rol,
          organizacion: memberDraft.organizacion.trim() || undefined,
          activo: memberDraft.activo,
        }),
      });

      const body = await response.json() as { error?: string };
      if (!response.ok) throw new Error(body.error ?? 'No se pudo guardar el miembro.');

      setMemberDraft(emptyMemberDraft());
      setEditingUid(null);
      setMemberMessage('Miembro actualizado.');
      await loadGovernance();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No se pudo guardar el miembro.');
    } finally {
      setSavingMember(false);
    }
  };

  const editMember = (member: MiembroCaso) => {
    setEditingUid(member.uid);
    setMemberDraft({
      uid: member.uid,
      email: member.email ?? '',
      nombre: member.nombre ?? '',
      rol: member.rol,
      organizacion: member.organizacion ?? '',
      activo: member.activo !== false,
    });
    setMemberMessage(null);
  };

  const deactivateMember = async (member: MiembroCaso) => {
    if (!canManageMembers) return;
    setSavingMember(true);
    setError(null);
    setMemberMessage(null);
    try {
      const token = idToken ?? await refreshIdToken();
      const response = await fetch(`/api/casos/${caseId}/members/${member.uid}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      const body = await response.json() as { error?: string };
      if (!response.ok) throw new Error(body.error ?? 'No se pudo desactivar el miembro.');
      setMemberMessage('Miembro desactivado.');
      if (editingUid === member.uid) {
        setEditingUid(null);
        setMemberDraft(emptyMemberDraft());
      }
      await loadGovernance();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No se pudo desactivar el miembro.');
    } finally {
      setSavingMember(false);
    }
  };

  const syncLabel = syncStatus === 'local'
    ? 'Local'
    : syncStatus === 'saving'
      ? 'Guardando'
      : syncStatus === 'conflict'
        ? 'Conflicto'
        : syncStatus === 'error'
          ? 'Error'
          : 'Sincronizado';

  return (
    <section className="audit-file-surface p-5">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-signal" style={{ fontFamily: 'var(--font-mono)' }}>
            Gobierno del expediente
          </div>
          <h2 className="mt-1 font-display text-xl font-bold text-ink" style={{ fontFamily: 'var(--font-display)', letterSpacing: '0em' }}>
            Sesion, permisos y auditoria
          </h2>
        </div>
        {authMode === 'firebase' && isAuthenticated && (
          <button
            type="button"
            onClick={() => void loadGovernance()}
            className="border border-rule px-3 py-1.5 text-xs text-ink-muted hover:border-signal hover:text-ink disabled:opacity-45"
            disabled={loading}
          >
            Actualizar
          </button>
        )}
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <GovMetric label="Modo" value={authMode === 'firebase' ? 'Firebase Auth' : 'Demo local'} />
        <GovMetric label="Sesion" value={usuario.nombre} />
        <GovMetric label="Rol" value={roleLabel(rol)} />
        <GovMetric label="Revision" value={`r${caso.revision ?? 0} / ${syncLabel}`} />
      </div>

      {syncMessage && (
        <div className="mt-4 border border-rule bg-[#0B0F15]/70 p-3 text-xs leading-relaxed text-ink-muted">
          {syncMessage}
        </div>
      )}

      {authMode !== 'firebase' ? (
        <div className="mt-4 border border-dashed border-rule bg-[#0B0F15]/60 p-4 text-xs leading-relaxed text-ink-muted">
          La demo usa roles locales para exposicion. Al activar `NEXT_PUBLIC_TRUE_AUDIT_AUTH_MODE=firebase`, este panel mostrara miembros reales y bitacora Firestore por usuario.
        </div>
      ) : !isAuthenticated ? (
        <div className="mt-4 border border-dashed border-rule bg-[#0B0F15]/60 p-4 text-xs leading-relaxed text-ink-muted">
          Vista publica de solo lectura. Inicia sesion para ver miembros del caso y auditoria de cambios.
        </div>
      ) : (
        <div className="mt-5 grid gap-4 xl:grid-cols-[0.85fr_1.15fr]">
          <div>
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted" style={{ fontFamily: 'var(--font-mono)' }}>
                Miembros autorizados
              </div>
              {canManageMembers && editingUid && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingUid(null);
                    setMemberDraft(emptyMemberDraft());
                  }}
                  className="text-xs text-ink-muted hover:text-ink"
                >
                  Nuevo miembro
                </button>
              )}
            </div>
            {canManageMembers && (
              <MemberForm
                draft={memberDraft}
                editing={Boolean(editingUid)}
                saving={savingMember}
                onChange={setMemberDraft}
                onSave={() => void saveMember()}
              />
            )}
            {memberMessage && <div className="mb-3 text-xs text-olive">{memberMessage}</div>}
            <div className="space-y-2">
              {members.length > 0 ? members.map(member => (
                <div key={member.uid} className="border border-rule bg-[#0B0F15]/70 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-ink">{member.nombre ?? member.email ?? member.uid}</div>
                      <div className="truncate text-xs text-ink-muted">{member.email ?? member.uid}</div>
                    </div>
                    <span className="shrink-0 border border-rule px-2 py-0.5 font-mono text-[9px] uppercase text-signal" style={{ fontFamily: 'var(--font-mono)' }}>
                      {roleLabel(member.rol)}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    {member.activo === false && <div className="text-xs text-vermilion">Inactivo</div>}
                    {canManageMembers && (
                      <>
                        <button
                          type="button"
                          onClick={() => editMember(member)}
                          className="border border-rule px-2 py-1 text-[11px] text-ink-muted hover:border-signal hover:text-ink"
                        >
                          Editar
                        </button>
                        {member.activo !== false && (
                          <button
                            type="button"
                            onClick={() => void deactivateMember(member)}
                            disabled={savingMember || member.uid === usuario.id}
                            className="border border-vermilion/45 px-2 py-1 text-[11px] text-vermilion hover:border-vermilion disabled:cursor-not-allowed disabled:opacity-45"
                          >
                            Desactivar
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )) : (
                <div className="border border-dashed border-rule p-4 text-xs text-ink-muted">
                  No hay miembros visibles o el usuario aun no tiene allowlist en Firestore.
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted" style={{ fontFamily: 'var(--font-mono)' }}>
              Bitacora de cambios
            </div>
            <div className="max-h-72 space-y-2 overflow-auto pr-1">
              {auditLog.length > 0 ? auditLog.map(entry => (
                <div key={entry.id} className="border border-rule bg-[#0B0F15]/70 p-3">
                  <div className="mb-1 flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.12em]" style={{ fontFamily: 'var(--font-mono)' }}>
                    <span className="text-signal">r{entry.revisionBefore} -&gt; r{entry.revisionAfter}</span>
                    <span className="text-ink-muted">{formatDate(entry.createdAt)}</span>
                    <span className="text-ink-muted">{roleLabel(entry.actorRole)}</span>
                  </div>
                  <div className="text-sm text-ink">{entry.summary}</div>
                  <div className="mt-1 truncate text-xs text-ink-muted">{entry.actorName ?? entry.actorEmail ?? entry.actorUid}</div>
                </div>
              )) : (
                <div className="border border-dashed border-rule p-4 text-xs text-ink-muted">
                  La bitacora aparecera cuando se registren cambios autenticados.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {error && <div className="mt-4 text-xs text-vermilion">{error}</div>}
    </section>
  );
}

type MemberDraft = {
  uid: string;
  email: string;
  nombre: string;
  rol: RolCaso;
  organizacion: string;
  activo: boolean;
};

function emptyMemberDraft(): MemberDraft {
  return {
    uid: '',
    email: '',
    nombre: '',
    rol: 'lector',
    organizacion: '',
    activo: true,
  };
}

const roleOptions: RolCaso[] = ['auditor_lider', 'auditor', 'auditado', 'lector'];

function MemberForm({
  draft,
  editing,
  saving,
  onChange,
  onSave,
}: {
  draft: MemberDraft;
  editing: boolean;
  saving: boolean;
  onChange: (draft: MemberDraft) => void;
  onSave: () => void;
}) {
  const update = <K extends keyof MemberDraft>(key: K, value: MemberDraft[K]) => {
    onChange({ ...draft, [key]: value });
  };

  return (
    <div className="mb-3 border border-rule bg-[#0B0F15]/70 p-3">
      <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.14em] text-signal" style={{ fontFamily: 'var(--font-mono)' }}>
        {editing ? 'Editar miembro' : 'Agregar miembro'}
      </div>
      <div className="grid gap-2">
        {!editing && (
          <label className="block text-xs text-ink-muted">
            UID opcional
            <input
              value={draft.uid}
              onChange={event => update('uid', event.target.value)}
              className="mt-1 w-full border border-rule bg-[#101721] px-2 py-2 text-xs text-ink outline-none focus:border-signal"
              placeholder="Se puede resolver por correo"
            />
          </label>
        )}
        <label className="block text-xs text-ink-muted">
          Correo Firebase Auth
          <input
            value={draft.email}
            onChange={event => update('email', event.target.value)}
            className="mt-1 w-full border border-rule bg-[#101721] px-2 py-2 text-xs text-ink outline-none focus:border-signal"
            placeholder="usuario@dominio.com"
            type="email"
          />
        </label>
        <label className="block text-xs text-ink-muted">
          Nombre visible
          <input
            value={draft.nombre}
            onChange={event => update('nombre', event.target.value)}
            className="mt-1 w-full border border-rule bg-[#101721] px-2 py-2 text-xs text-ink outline-none focus:border-signal"
            placeholder="Nombre del auditor o auditado"
          />
        </label>
        <div className="grid gap-2 sm:grid-cols-2">
          <label className="block text-xs text-ink-muted">
            Rol
            <select
              value={draft.rol}
              onChange={event => update('rol', event.target.value as RolCaso)}
              className="mt-1 w-full border border-rule bg-[#101721] px-2 py-2 text-xs text-ink outline-none focus:border-signal"
            >
              {roleOptions.map(option => (
                <option key={option} value={option}>{roleLabel(option)}</option>
              ))}
            </select>
          </label>
          <label className="block text-xs text-ink-muted">
            Organizacion
            <input
              value={draft.organizacion}
              onChange={event => update('organizacion', event.target.value)}
              className="mt-1 w-full border border-rule bg-[#101721] px-2 py-2 text-xs text-ink outline-none focus:border-signal"
              placeholder="Banco / equipo auditor"
            />
          </label>
        </div>
        <label className="flex items-center gap-2 text-xs text-ink-muted">
          <input
            type="checkbox"
            checked={draft.activo}
            onChange={event => update('activo', event.target.checked)}
          />
          Miembro activo
        </label>
        <button
          type="button"
          onClick={onSave}
          disabled={saving || (!draft.uid.trim() && !draft.email.trim())}
          className="border border-signal/55 bg-signal/15 px-3 py-2 text-xs font-semibold text-ink hover:border-signal disabled:cursor-not-allowed disabled:opacity-45"
        >
          {saving ? 'Guardando...' : editing ? 'Guardar cambios' : 'Agregar miembro'}
        </button>
      </div>
      <p className="mt-3 text-[11px] leading-relaxed text-ink-muted">
        Para crear cuentas nuevas de Firebase Auth usa la seccion Usuarios y roles. Aqui puedes agregar usuarios existentes por UID o correo.
      </p>
    </div>
  );
}

function GovMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-rule bg-[#0B0F15]/70 p-3">
      <div className="mb-1 font-mono text-[9px] uppercase tracking-[0.14em] text-ink-muted" style={{ fontFamily: 'var(--font-mono)' }}>
        {label}
      </div>
      <div className="truncate text-sm text-ink">{value}</div>
    </div>
  );
}
