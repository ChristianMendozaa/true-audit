'use client';

import { useState, type FormEvent } from 'react';
import { useAuth } from './AuthProvider';
import { roleLabel } from '@/lib/auth/permissions';
import type { RolUsuario } from '@/lib/types';

const roleOptions: Array<{ value: RolUsuario; label: string; detail: string }> = [
  { value: 'auditor', label: 'Auditor', detail: 'edicion completa' },
  { value: 'auditado', label: 'Auditado', detail: 'respuestas' },
  { value: 'demo', label: 'Demo', detail: 'solo lectura' },
];

export default function UserModeControl() {
  const {
    rol,
    setRol,
    usuario,
    authMode,
    authReady,
    isAuthenticated,
    authError,
    signIn,
    signOut,
  } = useAuth();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authBusy, setAuthBusy] = useState(false);
  const [signOutBusy, setSignOutBusy] = useState(false);

  const submitLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAuthBusy(true);
    try {
      await signIn(email, password);
    } finally {
      setAuthBusy(false);
    }
  };

  const handleSignOut = async () => {
    setSignOutBusy(true);
    try {
      await signOut();
      setOpen(false);
      setPassword('');
    } finally {
      setSignOutBusy(false);
    }
  };

  if (authMode === 'firebase') {
    return (
      <div className="relative flex max-w-full items-center gap-2">
        <div className="hidden min-w-0 border border-rule bg-[#0B0F15]/70 px-3 py-2 lg:block">
          <div className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${isAuthenticated ? 'bg-olive' : 'bg-signal'}`} />
            <div className="min-w-0">
              <div className="font-mono text-[9px] uppercase tracking-[0.12em] text-ink-muted" style={{ fontFamily: 'var(--font-mono)' }}>
                {isAuthenticated ? roleLabel(rol) : 'Acceso demo'}
              </div>
              <div className="max-w-44 truncate text-xs text-ink-soft">
                {authReady ? usuario.nombre : 'Verificando sesion'}
              </div>
            </div>
          </div>
        </div>

        {isAuthenticated ? (
          <button
            type="button"
            onClick={() => void handleSignOut()}
            disabled={signOutBusy}
            className="inline-flex min-h-10 shrink-0 items-center gap-2 border border-rule bg-[#101721] px-3 py-2 text-xs font-semibold text-ink outline-none hover:border-vermilion/70 disabled:cursor-wait disabled:opacity-60"
            aria-label="Cerrar sesion"
          >
            <SessionIcon />
            {signOutBusy ? 'Cerrando...' : 'Salir'}
          </button>
        ) : (
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setOpen(value => !value)}
              className="inline-flex min-h-10 items-center gap-2 border border-signal/45 bg-signal/10 px-3 py-2 text-xs font-semibold text-ink outline-none hover:border-signal"
              aria-expanded={open}
            >
              <SessionIcon />
              Iniciar sesion
            </button>
            {open && (
              <div className="fixed inset-x-3 top-20 z-50 md:absolute md:inset-auto md:right-0 md:top-12 md:w-96">
                <form
                  className="audit-file-surface border-signal/35 bg-[#0B0F15] p-4 shadow-2xl"
                  onSubmit={submitLogin}
                >
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div>
                      <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-signal" style={{ fontFamily: 'var(--font-mono)' }}>
                        Acceso seguro
                      </div>
                      <div className="mt-1 font-display text-lg font-bold text-ink" style={{ fontFamily: 'var(--font-display)', letterSpacing: '0em' }}>
                        Entrar al expediente
                      </div>
                      <p className="mt-1 text-xs leading-relaxed text-ink-muted">
                        Usa una cuenta autorizada para editar evidencias, hallazgos o administrar roles.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setOpen(false)}
                      className="border border-rule px-2 py-1 text-xs text-ink-muted hover:border-signal hover:text-ink"
                      aria-label="Cerrar panel de login"
                    >
                      X
                    </button>
                  </div>
                  <label className="mb-3 block text-xs font-medium text-ink-muted">
                    Correo
                    <input
                      value={email}
                      onChange={event => setEmail(event.target.value)}
                      className="mt-1 w-full border border-rule bg-[#101721] px-3 py-2.5 text-sm text-ink outline-none transition-colors focus:border-signal"
                      type="email"
                      autoComplete="email"
                      placeholder="auditor@dominio.com"
                    />
                  </label>
                  <label className="mb-3 block text-xs font-medium text-ink-muted">
                    Contrasena
                    <input
                      value={password}
                      onChange={event => setPassword(event.target.value)}
                      className="mt-1 w-full border border-rule bg-[#101721] px-3 py-2.5 text-sm text-ink outline-none transition-colors focus:border-signal"
                      type="password"
                      autoComplete="current-password"
                      placeholder="Contrasena de Firebase Auth"
                    />
                  </label>
                  {authError && (
                    <p className="mb-3 border border-vermilion/45 bg-vermilion/10 p-2 text-xs leading-relaxed text-vermilion">
                      {authError}
                    </p>
                  )}
                  <button
                    type="submit"
                    disabled={authBusy || !email.trim() || !password}
                    className="w-full border border-signal/55 bg-signal/15 px-3 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-signal disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {authBusy ? 'Verificando...' : 'Entrar con Firebase'}
                  </button>
                  <div className="mt-3 border-t border-rule pt-3 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-muted" style={{ fontFamily: 'var(--font-mono)' }}>
                    Demo publica: solo lectura / Edicion: requiere membresia
                  </div>
                </form>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex max-w-full items-center gap-2 border border-rule bg-[#0B0F15]/70 px-2 py-1.5">
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

function SessionIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <rect x="2" y="1.5" width="10" height="11" rx="1.2" stroke="currentColor" strokeWidth="1.2" />
      <path d="M5.2 7h5.1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M8.4 4.9 10.5 7 8.4 9.1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
