'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { roleLabel } from '@/lib/auth/permissions';
import { useAuth } from '@/components/auth/AuthProvider';
import { useCaseData } from '@/components/data/CaseDataProvider';
import type { AuditLogEntry, MiembroCaso, RolCaso } from '@/lib/types';

export type AdminView = 'usuarios' | 'movimientos';

interface CaseAdminClientProps {
  caseId: string;
  caseNumber: string;
  bankName: string;
  view: AdminView;
}

interface GovernanceResponse {
  members: MiembroCaso[];
  auditLog: AuditLogEntry[];
}

type UserDraft = {
  mode: 'create' | 'existing';
  uid: string;
  email: string;
  password: string;
  nombre: string;
  rol: RolCaso;
  organizacion: string;
  activo: boolean;
};

const roleOptions: RolCaso[] = ['auditor_lider', 'auditor', 'auditado', 'lector'];

function emptyUserDraft(): UserDraft {
  return {
    mode: 'create',
    uid: '',
    email: '',
    password: '',
    nombre: '',
    rol: 'auditor',
    organizacion: 'True Audit',
    activo: true,
  };
}

function formatDate(value?: string) {
  if (!value) return 'sin fecha';
  return new Intl.DateTimeFormat('es-BO', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function actionLabel(action: string) {
  switch (action) {
    case 'user.create':
      return 'Usuario creado';
    case 'member.upsert':
      return 'Miembro agregado';
    case 'member.update':
      return 'Miembro actualizado';
    case 'member.seed':
      return 'Alta inicial';
    case 'case.update':
      return 'Expediente actualizado';
    default:
      return action;
  }
}

export default function CaseAdminClient({ caseId, caseNumber, bankName, view }: CaseAdminClientProps) {
  const {
    authMode,
    authReady,
    isAuthenticated,
    idToken,
    refreshIdToken,
    canManageMembers,
    usuario,
  } = useAuth();
  const { isHydrated } = useCaseData();
  const [members, setMembers] = useState<MiembroCaso[]>([]);
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([]);
  const [draft, setDraft] = useState<UserDraft>(() => emptyUserDraft());
  const [showUserForm, setShowUserForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadAdmin = useCallback(async () => {
    if (authMode !== 'firebase' || !isAuthenticated || !isHydrated || !canManageMembers) return;

    setLoading(true);
    setError(null);
    try {
      const token = idToken ?? await refreshIdToken();
      const response = await fetch(`/api/casos/${caseId}/governance?limit=120`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        cache: 'no-store',
      });
      const body = await response.json() as GovernanceResponse & { error?: string };
      if (!response.ok) throw new Error(body.error ?? 'No se pudo cargar administracion.');
      setMembers(body.members ?? []);
      setAuditLog(body.auditLog ?? []);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No se pudo cargar administracion.');
    } finally {
      setLoading(false);
    }
  }, [authMode, canManageMembers, caseId, idToken, isAuthenticated, isHydrated, refreshIdToken]);

  useEffect(() => {
    queueMicrotask(() => {
      void loadAdmin();
    });
  }, [loadAdmin]);

  const updateDraft = (patch: Partial<UserDraft>) => {
    setDraft(current => ({ ...current, ...patch }));
  };

  const saveUser = async () => {
    if (!canManageMembers) return;
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const token = idToken ?? await refreshIdToken();
      const response = await fetch(`/api/casos/${caseId}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          createAuthUser: draft.mode === 'create',
          uid: draft.mode === 'existing' ? draft.uid.trim() || undefined : undefined,
          email: draft.email.trim() || undefined,
          password: draft.mode === 'create' ? draft.password : undefined,
          nombre: draft.nombre.trim() || undefined,
          rol: draft.rol,
          organizacion: draft.organizacion.trim() || undefined,
          activo: draft.activo,
        }),
      });
      const body = await response.json() as { error?: string };
      if (!response.ok) throw new Error(body.error ?? 'No se pudo guardar el usuario.');

      setDraft(emptyUserDraft());
      setShowUserForm(false);
      setMessage(draft.mode === 'create'
        ? 'Usuario creado en Firebase Auth y agregado al expediente.'
        : 'Miembro existente agregado al expediente.');
      await loadAdmin();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No se pudo guardar el usuario.');
    } finally {
      setSaving(false);
    }
  };

  const patchMember = async (member: MiembroCaso, patch: Partial<Pick<MiembroCaso, 'rol' | 'activo'>>) => {
    if (!canManageMembers) return;
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const token = idToken ?? await refreshIdToken();
      const response = await fetch(`/api/casos/${caseId}/members/${member.uid}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          email: member.email ?? undefined,
          nombre: member.nombre ?? undefined,
          organizacion: member.organizacion ?? undefined,
          ...patch,
        }),
      });
      const body = await response.json() as { error?: string };
      if (!response.ok) throw new Error(body.error ?? 'No se pudo actualizar el miembro.');
      setMessage('Miembro actualizado.');
      await loadAdmin();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No se pudo actualizar el miembro.');
    } finally {
      setSaving(false);
    }
  };

  const shellTitle = view === 'usuarios' ? 'Usuarios y roles' : 'Movimientos del expediente';
  const shellKicker = view === 'usuarios' ? 'Control de acceso' : 'Registro de actividad';

  if (authMode !== 'firebase') {
    return (
      <AdminShell bankName={bankName} caseNumber={caseNumber} kicker={shellKicker} title={shellTitle}>
        <AdminNotice
          title="Administracion desactivada"
          text="Esta vista se activa con NEXT_PUBLIC_TRUE_AUDIT_AUTH_MODE=firebase. En modo demo se conserva el selector local de roles para exposicion."
        />
      </AdminShell>
    );
  }

  if (!authReady || (isAuthenticated && !isHydrated)) {
    return (
      <AdminShell bankName={bankName} caseNumber={caseNumber} kicker={shellKicker} title={shellTitle}>
        <AdminNotice title="Verificando permisos" text="True Audit esta cargando la membresia del expediente antes de mostrar administracion." />
      </AdminShell>
    );
  }

  if (!isAuthenticated) {
    return (
      <AdminShell bankName={bankName} caseNumber={caseNumber} kicker={shellKicker} title={shellTitle}>
        <AdminNotice
          title="Sesion requerida"
          text="Inicia sesion desde la barra superior para acceder a usuarios, roles y registros del expediente."
        />
      </AdminShell>
    );
  }

  if (!canManageMembers) {
    return (
      <AdminShell bankName={bankName} caseNumber={caseNumber} kicker={shellKicker} title={shellTitle}>
        <AdminNotice
          title="Acceso restringido"
          text={`Tu rol actual es ${roleLabel(usuario.rol)}. Solo un auditor lider puede ver y administrar esta seccion.`}
        />
      </AdminShell>
    );
  }

  return (
    <AdminShell bankName={bankName} caseNumber={caseNumber} kicker={shellKicker} title={shellTitle}>
      {message && <div className="mb-4 border border-olive/45 bg-olive/10 p-3 text-xs text-olive">{message}</div>}
      {error && <div className="mb-4 border border-vermilion/45 bg-vermilion/10 p-3 text-xs text-vermilion">{error}</div>}

      {view === 'usuarios' ? (
        <UsersAndRolesView
          draft={draft}
          loading={loading}
          members={members}
          saving={saving}
          showForm={showUserForm}
          usuarioId={usuario.id}
          onDraftChange={updateDraft}
          onPatchMember={patchMember}
          onRefresh={loadAdmin}
          onSaveUser={saveUser}
          onShowFormChange={setShowUserForm}
        />
      ) : (
        <MovementsView
          auditLog={auditLog}
          loading={loading}
          onRefresh={loadAdmin}
        />
      )}
    </AdminShell>
  );
}

function UsersAndRolesView({
  draft,
  loading,
  members,
  onDraftChange,
  onPatchMember,
  onRefresh,
  onSaveUser,
  onShowFormChange,
  saving,
  showForm,
  usuarioId,
}: {
  draft: UserDraft;
  loading: boolean;
  members: MiembroCaso[];
  onDraftChange: (patch: Partial<UserDraft>) => void;
  onPatchMember: (member: MiembroCaso, patch: Partial<Pick<MiembroCaso, 'rol' | 'activo'>>) => Promise<void>;
  onRefresh: () => Promise<void>;
  onSaveUser: () => Promise<void>;
  onShowFormChange: (value: boolean) => void;
  saving: boolean;
  showForm: boolean;
  usuarioId: string;
}) {
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'todos' | RolCaso>('todos');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'activo' | 'inactivo'>('todos');

  const filteredMembers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return members.filter(member => {
      const text = [
        member.uid,
        member.email ?? '',
        member.nombre ?? '',
        member.organizacion ?? '',
        member.rol,
      ].join(' ').toLowerCase();
      const matchesQuery = !normalizedQuery || text.includes(normalizedQuery);
      const matchesRole = roleFilter === 'todos' || member.rol === roleFilter;
      const matchesStatus = statusFilter === 'todos'
        || (statusFilter === 'activo' && member.activo !== false)
        || (statusFilter === 'inactivo' && member.activo === false);
      return matchesQuery && matchesRole && matchesStatus;
    });
  }, [members, query, roleFilter, statusFilter]);

  return (
    <section className="audit-file-surface p-5">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-signal" style={{ fontFamily: 'var(--font-mono)' }}>
            Usuarios autorizados
          </div>
          <h2 className="mt-1 font-display text-xl font-bold text-ink" style={{ fontFamily: 'var(--font-display)', letterSpacing: '0em' }}>
            Matriz de acceso del expediente
          </h2>
          <p className="mt-1 max-w-2xl text-xs leading-relaxed text-ink-muted">
            Administra cuentas, roles y estado de acceso del caso. Los cambios quedan registrados en movimientos.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void onRefresh()}
            disabled={loading}
            className="border border-rule px-3 py-2 text-xs text-ink-muted hover:border-signal hover:text-ink disabled:opacity-45"
          >
            {loading ? 'Actualizando...' : 'Actualizar'}
          </button>
          <button
            type="button"
            onClick={() => onShowFormChange(!showForm)}
            className="border border-signal/55 bg-signal/15 px-3 py-2 text-xs font-semibold text-ink hover:border-signal"
          >
            {showForm ? 'Cerrar formulario' : 'Nuevo usuario'}
          </button>
        </div>
      </div>

      <div className="mb-4 grid gap-3 lg:grid-cols-[1fr_180px_180px]">
        <label className="block text-xs text-ink-muted">
          Buscar
          <input
            value={query}
            onChange={event => setQuery(event.target.value)}
            className="mt-1 w-full border border-rule bg-[#101721] px-3 py-2 text-sm text-ink outline-none focus:border-signal"
            placeholder="Nombre, correo, UID u organizacion"
          />
        </label>
        <label className="block text-xs text-ink-muted">
          Rol
          <select
            value={roleFilter}
            onChange={event => setRoleFilter(event.target.value as 'todos' | RolCaso)}
            className="mt-1 w-full border border-rule bg-[#101721] px-3 py-2 text-sm text-ink outline-none focus:border-signal"
          >
            <option value="todos">Todos</option>
            {roleOptions.map(option => (
              <option key={option} value={option}>{roleLabel(option)}</option>
            ))}
          </select>
        </label>
        <label className="block text-xs text-ink-muted">
          Estado
          <select
            value={statusFilter}
            onChange={event => setStatusFilter(event.target.value as 'todos' | 'activo' | 'inactivo')}
            className="mt-1 w-full border border-rule bg-[#101721] px-3 py-2 text-sm text-ink outline-none focus:border-signal"
          >
            <option value="todos">Todos</option>
            <option value="activo">Activos</option>
            <option value="inactivo">Inactivos</option>
          </select>
        </label>
      </div>

      {showForm && (
        <div className="mb-4 border border-rule bg-[#0B0F15]/70 p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-signal" style={{ fontFamily: 'var(--font-mono)' }}>
              Alta de usuario
            </div>
            <div className="grid w-full gap-2 sm:w-auto sm:grid-cols-2">
              <button
                type="button"
                onClick={() => onDraftChange({ mode: 'create' })}
                className={`border px-3 py-2 text-xs font-semibold ${draft.mode === 'create' ? 'border-signal bg-signal/15 text-ink' : 'border-rule text-ink-muted hover:border-signal'}`}
              >
                Crear Auth
              </button>
              <button
                type="button"
                onClick={() => onDraftChange({ mode: 'existing' })}
                className={`border px-3 py-2 text-xs font-semibold ${draft.mode === 'existing' ? 'border-signal bg-signal/15 text-ink' : 'border-rule text-ink-muted hover:border-signal'}`}
              >
                Existente
              </button>
            </div>
          </div>

          <div className="grid gap-3 lg:grid-cols-3">
            {draft.mode === 'existing' && (
              <label className="block text-xs text-ink-muted">
                UID opcional
                <input
                  value={draft.uid}
                  onChange={event => onDraftChange({ uid: event.target.value })}
                  className="mt-1 w-full border border-rule bg-[#101721] px-2 py-2 text-xs text-ink outline-none focus:border-signal"
                  placeholder="Se puede resolver por correo"
                />
              </label>
            )}
            <label className="block text-xs text-ink-muted">
              Correo
              <input
                value={draft.email}
                onChange={event => onDraftChange({ email: event.target.value })}
                className="mt-1 w-full border border-rule bg-[#101721] px-2 py-2 text-xs text-ink outline-none focus:border-signal"
                type="email"
                placeholder="usuario@dominio.com"
              />
            </label>
            {draft.mode === 'create' && (
              <label className="block text-xs text-ink-muted">
                Contrasena temporal
                <input
                  value={draft.password}
                  onChange={event => onDraftChange({ password: event.target.value })}
                  className="mt-1 w-full border border-rule bg-[#101721] px-2 py-2 text-xs text-ink outline-none focus:border-signal"
                  type="password"
                  placeholder="Minimo 6 caracteres"
                />
              </label>
            )}
            <label className="block text-xs text-ink-muted">
              Nombre visible
              <input
                value={draft.nombre}
                onChange={event => onDraftChange({ nombre: event.target.value })}
                className="mt-1 w-full border border-rule bg-[#101721] px-2 py-2 text-xs text-ink outline-none focus:border-signal"
                placeholder="Nombre del auditor o auditado"
              />
            </label>
            <label className="block text-xs text-ink-muted">
              Rol
              <select
                value={draft.rol}
                onChange={event => onDraftChange({ rol: event.target.value as RolCaso })}
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
                onChange={event => onDraftChange({ organizacion: event.target.value })}
                className="mt-1 w-full border border-rule bg-[#101721] px-2 py-2 text-xs text-ink outline-none focus:border-signal"
                placeholder="True Audit / Banco auditado"
              />
            </label>
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <label className="flex items-center gap-2 text-xs text-ink-muted">
              <input
                type="checkbox"
                checked={draft.activo}
                onChange={event => onDraftChange({ activo: event.target.checked })}
              />
              Usuario activo en el expediente
            </label>
            <button
              type="button"
              onClick={() => void onSaveUser()}
              disabled={saving || !draft.email.trim() || (draft.mode === 'create' && draft.password.length < 6)}
              className="border border-signal/55 bg-signal/15 px-4 py-2 text-xs font-semibold text-ink hover:border-signal disabled:cursor-not-allowed disabled:opacity-45"
            >
              {saving ? 'Guardando...' : draft.mode === 'create' ? 'Crear usuario y asignar rol' : 'Agregar miembro existente'}
            </button>
          </div>
        </div>
      )}

      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted" style={{ fontFamily: 'var(--font-mono)' }}>
          {filteredMembers.length} de {members.length} usuarios
        </div>
      </div>

      <div className="overflow-x-auto border border-rule">
        <table className="min-w-[860px] w-full border-collapse text-left text-sm">
          <thead className="bg-[#0B0F15] text-[10px] uppercase tracking-[0.12em] text-ink-muted" style={{ fontFamily: 'var(--font-mono)' }}>
            <tr>
              <th className="border-b border-rule px-3 py-3 font-medium">Usuario</th>
              <th className="border-b border-rule px-3 py-3 font-medium">Rol</th>
              <th className="border-b border-rule px-3 py-3 font-medium">Estado</th>
              <th className="border-b border-rule px-3 py-3 font-medium">Organizacion</th>
              <th className="border-b border-rule px-3 py-3 font-medium">UID</th>
              <th className="border-b border-rule px-3 py-3 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredMembers.map(member => (
              <tr key={member.uid} className="border-b border-rule/70 bg-[#0E141D]/75 last:border-b-0">
                <td className="px-3 py-3">
                  <div className="max-w-64 truncate font-semibold text-ink">{member.nombre ?? member.email ?? member.uid}</div>
                  <div className="max-w-64 truncate text-xs text-ink-muted">{member.email ?? 'sin correo visible'}</div>
                </td>
                <td className="px-3 py-3">
                  <select
                    value={member.rol}
                    disabled={saving || member.uid === usuarioId}
                    onChange={event => void onPatchMember(member, { rol: event.target.value as RolCaso })}
                    className="w-full min-w-36 border border-rule bg-[#101721] px-2 py-2 text-xs text-ink outline-none focus:border-signal disabled:cursor-not-allowed disabled:opacity-45"
                    aria-label={`Rol de ${member.email ?? member.uid}`}
                  >
                    {roleOptions.map(option => (
                      <option key={option} value={option}>{roleLabel(option)}</option>
                    ))}
                  </select>
                </td>
                <td className="px-3 py-3">
                  <span className={`inline-flex border px-2 py-1 font-mono text-[9px] uppercase tracking-[0.1em] ${member.activo === false ? 'border-vermilion/45 text-vermilion' : 'border-olive/45 text-olive'}`} style={{ fontFamily: 'var(--font-mono)' }}>
                    {member.activo === false ? 'inactivo' : 'activo'}
                  </span>
                </td>
                <td className="max-w-44 truncate px-3 py-3 text-xs text-ink-muted">{member.organizacion ?? '-'}</td>
                <td className="max-w-48 truncate px-3 py-3 font-mono text-[10px] text-ink-muted" style={{ fontFamily: 'var(--font-mono)' }}>{member.uid}</td>
                <td className="px-3 py-3">
                  <button
                    type="button"
                    disabled={saving || member.uid === usuarioId}
                    onClick={() => void onPatchMember(member, { activo: member.activo === false })}
                    className="border border-rule px-3 py-2 text-xs text-ink-muted hover:border-signal hover:text-ink disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    {member.activo === false ? 'Reactivar' : 'Desactivar'}
                  </button>
                </td>
              </tr>
            ))}
            {filteredMembers.length === 0 && (
              <tr>
                <td className="px-3 py-6 text-center text-xs text-ink-muted" colSpan={6}>
                  No hay usuarios con esos filtros.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function MovementsView({
  auditLog,
  loading,
  onRefresh,
}: {
  auditLog: AuditLogEntry[];
  loading: boolean;
  onRefresh: () => Promise<void>;
}) {
  const [actorFilter, setActorFilter] = useState('todos');
  const [actionFilter, setActionFilter] = useState('todos');
  const [query, setQuery] = useState('');

  const auditActors = useMemo(() => {
    const actors = new Map<string, string>();
    auditLog.forEach(entry => {
      actors.set(entry.actorUid, entry.actorName ?? entry.actorEmail ?? entry.actorUid);
    });
    return Array.from(actors.entries()).map(([uid, label]) => ({ uid, label }));
  }, [auditLog]);

  const auditActions = useMemo(() => Array.from(new Set(auditLog.map(entry => entry.action))), [auditLog]);

  const filteredAuditLog = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return auditLog.filter(entry => {
      const text = [
        entry.summary,
        entry.entity,
        entry.actorName ?? '',
        entry.actorEmail ?? '',
        entry.actorUid,
        entry.action,
      ].join(' ').toLowerCase();
      const matchesQuery = !normalizedQuery || text.includes(normalizedQuery);
      const matchesActor = actorFilter === 'todos' || entry.actorUid === actorFilter;
      const matchesAction = actionFilter === 'todos' || entry.action === actionFilter;
      return matchesQuery && matchesActor && matchesAction;
    });
  }, [actionFilter, actorFilter, auditLog, query]);

  const movementCounts = useMemo(() => {
    const counts = new Map<string, { label: string; count: number; last?: string }>();
    auditLog.forEach(entry => {
      const key = entry.actorUid;
      const current = counts.get(key) ?? {
        label: entry.actorName ?? entry.actorEmail ?? entry.actorUid,
        count: 0,
        last: entry.createdAt,
      };
      counts.set(key, {
        ...current,
        count: current.count + 1,
        last: current.last && entry.createdAt && new Date(current.last) > new Date(entry.createdAt)
          ? current.last
          : entry.createdAt ?? current.last,
      });
    });
    return Array.from(counts.entries()).map(([uid, value]) => ({ uid, ...value }));
  }, [auditLog]);

  return (
    <section className="audit-file-surface p-5">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-signal" style={{ fontFamily: 'var(--font-mono)' }}>
            Bitacora del expediente
          </div>
          <h2 className="mt-1 font-display text-xl font-bold text-ink" style={{ fontFamily: 'var(--font-display)', letterSpacing: '0em' }}>
            Registro de movimientos por usuario
          </h2>
          <p className="mt-1 max-w-2xl text-xs leading-relaxed text-ink-muted">
            Revisa quien cambio el expediente, cuando lo hizo y que entidad quedo afectada.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void onRefresh()}
          disabled={loading}
          className="border border-rule px-3 py-2 text-xs text-ink-muted hover:border-signal hover:text-ink disabled:opacity-45"
        >
          {loading ? 'Actualizando...' : 'Actualizar'}
        </button>
      </div>

      <div className="mb-4 grid gap-3 md:grid-cols-3">
        {movementCounts.slice(0, 3).map(item => (
          <div key={item.uid} className="border border-rule bg-[#0B0F15]/70 p-3">
            <div className="truncate text-sm font-semibold text-ink">{item.label}</div>
            <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-signal" style={{ fontFamily: 'var(--font-mono)' }}>
              {item.count} movimientos
            </div>
            <div className="mt-1 text-[11px] text-ink-muted">{formatDate(item.last)}</div>
          </div>
        ))}
        {movementCounts.length === 0 && (
          <div className="border border-dashed border-rule p-3 text-xs text-ink-muted md:col-span-3">
            Todavia no hay movimientos autenticados para resumir.
          </div>
        )}
      </div>

      <div className="mb-4 grid gap-3 lg:grid-cols-[1fr_220px_220px]">
        <label className="block text-xs text-ink-muted">
          Buscar
          <input
            value={query}
            onChange={event => setQuery(event.target.value)}
            className="mt-1 w-full border border-rule bg-[#101721] px-3 py-2 text-sm text-ink outline-none focus:border-signal"
            placeholder="Resumen, entidad, usuario o accion"
          />
        </label>
        <label className="block text-xs text-ink-muted">
          Usuario
          <select
            value={actorFilter}
            onChange={event => setActorFilter(event.target.value)}
            className="mt-1 w-full border border-rule bg-[#101721] px-3 py-2 text-sm text-ink outline-none focus:border-signal"
          >
            <option value="todos">Todos</option>
            {auditActors.map(actor => (
              <option key={actor.uid} value={actor.uid}>{actor.label}</option>
            ))}
          </select>
        </label>
        <label className="block text-xs text-ink-muted">
          Accion
          <select
            value={actionFilter}
            onChange={event => setActionFilter(event.target.value)}
            className="mt-1 w-full border border-rule bg-[#101721] px-3 py-2 text-sm text-ink outline-none focus:border-signal"
          >
            <option value="todos">Todas</option>
            {auditActions.map(action => (
              <option key={action} value={action}>{actionLabel(action)}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="overflow-x-auto border border-rule">
        <table className="min-w-[920px] w-full border-collapse text-left text-sm">
          <thead className="bg-[#0B0F15] text-[10px] uppercase tracking-[0.12em] text-ink-muted" style={{ fontFamily: 'var(--font-mono)' }}>
            <tr>
              <th className="border-b border-rule px-3 py-3 font-medium">Fecha</th>
              <th className="border-b border-rule px-3 py-3 font-medium">Usuario</th>
              <th className="border-b border-rule px-3 py-3 font-medium">Accion</th>
              <th className="border-b border-rule px-3 py-3 font-medium">Entidad</th>
              <th className="border-b border-rule px-3 py-3 font-medium">Resumen</th>
              <th className="border-b border-rule px-3 py-3 font-medium">Revision</th>
            </tr>
          </thead>
          <tbody>
            {filteredAuditLog.map(entry => (
              <tr key={entry.id} className="border-b border-rule/70 bg-[#0E141D]/75 last:border-b-0">
                <td className="whitespace-nowrap px-3 py-3 text-xs text-ink-muted">{formatDate(entry.createdAt)}</td>
                <td className="px-3 py-3">
                  <div className="max-w-48 truncate font-semibold text-ink">{entry.actorName ?? entry.actorEmail ?? entry.actorUid}</div>
                  <div className="text-xs text-ink-muted">{roleLabel(entry.actorRole)}</div>
                </td>
                <td className="px-3 py-3">
                  <span className="border border-signal/45 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.1em] text-signal" style={{ fontFamily: 'var(--font-mono)' }}>
                    {actionLabel(entry.action)}
                  </span>
                </td>
                <td className="max-w-48 truncate px-3 py-3 font-mono text-[10px] text-ink-muted" style={{ fontFamily: 'var(--font-mono)' }}>
                  {entry.entity}
                </td>
                <td className="min-w-72 px-3 py-3 text-sm leading-relaxed text-ink">{entry.summary}</td>
                <td className="whitespace-nowrap px-3 py-3 font-mono text-[10px] text-ink-muted" style={{ fontFamily: 'var(--font-mono)' }}>
                  r{entry.revisionBefore} -&gt; r{entry.revisionAfter}
                </td>
              </tr>
            ))}
            {filteredAuditLog.length === 0 && (
              <tr>
                <td className="px-3 py-6 text-center text-xs text-ink-muted" colSpan={6}>
                  No hay movimientos con esos filtros.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function AdminShell({
  bankName,
  caseNumber,
  children,
  kicker,
  title,
}: {
  bankName: string;
  caseNumber: string;
  children: React.ReactNode;
  kicker: string;
  title: string;
}) {
  return (
    <div className="w-full max-w-none p-6 xl:p-8">
      <section className="audit-file-surface mb-6 p-6">
        <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-signal" style={{ fontFamily: 'var(--font-mono)' }}>
          {kicker}
        </div>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-ink" style={{ fontFamily: 'var(--font-display)', letterSpacing: '0em' }}>
              {title}
            </h1>
            <div className="mt-2 text-sm text-ink-muted">
              Expediente {caseNumber} / {bankName}
            </div>
          </div>
          <div className="border border-rule px-3 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-muted" style={{ fontFamily: 'var(--font-mono)' }}>
            Auth + Firestore
          </div>
        </div>
      </section>
      {children}
    </div>
  );
}

function AdminNotice({ title, text }: { title: string; text: string }) {
  return (
    <div className="audit-file-surface p-5">
      <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-signal" style={{ fontFamily: 'var(--font-mono)' }}>
        {title}
      </div>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-muted">{text}</p>
    </div>
  );
}
