'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { RolUsuario, UsuarioSesion } from '@/lib/types';

const SESSION_KEY = 'true-audit:session-role';

const demoUsers: Record<RolUsuario, UsuarioSesion> = {
  auditor: {
    id: 'USR-AUDITOR',
    nombre: 'Equipo auditor',
    rol: 'auditor',
    organizacion: 'True Audit',
  },
  auditado: {
    id: 'USR-AUDITADO',
    nombre: 'Banco auditado',
    rol: 'auditado',
    organizacion: 'Banco Cordillera S.A.',
  },
  demo: {
    id: 'USR-DEMO',
    nombre: 'Modo exposicion',
    rol: 'demo',
    organizacion: 'Demo academica',
  },
};

interface AuthContextValue {
  usuario: UsuarioSesion;
  rol: RolUsuario;
  setRol: (rol: RolUsuario) => void;
  canEditAuditWork: boolean;
  canRegisterResponse: boolean;
  isReadOnlyDemo: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [rol, setRolState] = useState<RolUsuario>('auditor');

  useEffect(() => {
    queueMicrotask(() => {
      const saved = window.localStorage.getItem(SESSION_KEY) as RolUsuario | null;
      if (saved && saved in demoUsers) {
        setRolState(saved);
      }
    });
  }, []);

  const setRol = useCallback((nextRol: RolUsuario) => {
    setRolState(nextRol);
    window.localStorage.setItem(SESSION_KEY, nextRol);
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    usuario: demoUsers[rol],
    rol,
    setRol,
    canEditAuditWork: rol === 'auditor',
    canRegisterResponse: rol === 'auditado' || rol === 'auditor',
    isReadOnlyDemo: rol === 'demo',
  }), [rol, setRol]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}
