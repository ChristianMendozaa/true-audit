'use client';

import { useAuth } from './AuthProvider';
import type { RolUsuario } from '@/lib/types';

const roleOptions: Array<{ value: RolUsuario; label: string; detail: string }> = [
  { value: 'auditor', label: 'Auditor', detail: 'edicion completa' },
  { value: 'auditado', label: 'Auditado', detail: 'respuestas' },
  { value: 'demo', label: 'Demo', detail: 'solo lectura' },
];

export default function UserModeControl() {
  const { rol, setRol, usuario } = useAuth();

  return (
    <div className="hidden items-center gap-2 border border-rule bg-[#0B0F15]/70 px-2 py-1.5 md:flex">
      <div className="min-w-0 px-2">
        <div className="font-mono text-[9px] uppercase tracking-[0.12em] text-ink-muted" style={{ fontFamily: 'var(--font-mono)' }}>
          Sesion local
        </div>
        <div className="truncate text-xs text-ink-soft">{usuario.nombre}</div>
      </div>
      <select
        value={rol}
        onChange={event => setRol(event.target.value as RolUsuario)}
        className="border border-rule bg-[#101721] px-2 py-1 text-xs text-ink outline-none focus:border-signal"
        aria-label="Seleccionar rol de sesion"
      >
        {roleOptions.map(option => (
          <option key={option.value} value={option.value}>
            {option.label} / {option.detail}
          </option>
        ))}
      </select>
    </div>
  );
}
