'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  onIdTokenChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth';
import {
  canRoleEditAuditWork,
  canRoleManageMembers,
  canRoleRegisterResponse,
  canRoleReviewResponse,
  isCaseRole,
} from '@/lib/auth/permissions';
import { getFirebaseClientAuth, isFirebaseAuthMode } from '@/lib/firebase/client';
import type { MiembroCaso, RolCaso, RolUsuario, UsuarioSesion } from '@/lib/types';

const SESSION_KEY = 'true-audit:session-role';

const demoUsers: Record<RolUsuario, UsuarioSesion> = {
  auditor_lider: {
    id: 'USR-AUDITOR-LIDER',
    nombre: 'Auditor lider',
    rol: 'auditor_lider',
    organizacion: 'True Audit',
  },
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
  lector: {
    id: 'USR-LECTOR',
    nombre: 'Lector invitado',
    rol: 'lector',
    organizacion: 'True Audit',
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
  authMode: 'demo' | 'firebase';
  authReady: boolean;
  isAuthenticated: boolean;
  firebaseUser: User | null;
  idToken: string | null;
  miembroCaso: MiembroCaso | null;
  authError: string | null;
  canEditAuditWork: boolean;
  canRegisterResponse: boolean;
  canReviewResponse: boolean;
  canManageMembers: boolean;
  isReadOnlyDemo: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  setCaseMembership: (member: MiembroCaso | null) => void;
  refreshIdToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const authMode = isFirebaseAuthMode() ? 'firebase' : 'demo';
  const [rol, setRolState] = useState<RolUsuario>('auditor');
  const [authReady, setAuthReady] = useState(authMode === 'demo');
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [idToken, setIdToken] = useState<string | null>(null);
  const [miembroCaso, setMiembroCaso] = useState<MiembroCaso | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    if (authMode === 'firebase') return;

    queueMicrotask(() => {
      const saved = window.localStorage.getItem(SESSION_KEY) as RolUsuario | null;
      if (saved && saved in demoUsers) {
        setRolState(saved);
      }
    });
  }, [authMode]);

  useEffect(() => {
    if (authMode !== 'firebase') return;

    const auth = getFirebaseClientAuth();
    if (!auth) {
      queueMicrotask(() => {
        setAuthReady(true);
        setAuthError('Firebase Auth no esta configurado en las variables publicas.');
      });
      return;
    }

    return onIdTokenChanged(auth, async user => {
      setFirebaseUser(user);
      setMiembroCaso(null);
      setIdToken(user ? await user.getIdToken() : null);
      setAuthReady(true);
    });
  }, [authMode]);

  const setRol = useCallback((nextRol: RolUsuario) => {
    if (authMode === 'firebase') return;
    setRolState(nextRol);
    window.localStorage.setItem(SESSION_KEY, nextRol);
  }, [authMode]);

  const setCaseMembership = useCallback((member: MiembroCaso | null) => {
    setMiembroCaso(member);
    if (authMode === 'firebase') {
      setRolState(member?.rol ?? 'lector');
    }
  }, [authMode]);

  const signIn = useCallback(async (email: string, password: string) => {
    if (authMode !== 'firebase') return;
    const auth = getFirebaseClientAuth();
    if (!auth) {
      setAuthError('Firebase Auth no esta configurado.');
      return;
    }
    setAuthError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch {
      setAuthError('No se pudo iniciar sesion. Revisa correo, contrasena o permisos del usuario.');
    }
  }, [authMode]);

  const signOut = useCallback(async () => {
    if (authMode !== 'firebase') return;
    const auth = getFirebaseClientAuth();
    if (!auth) return;
    await firebaseSignOut(auth);
    setMiembroCaso(null);
    setRolState('lector');
  }, [authMode]);

  const refreshIdToken = useCallback(async () => {
    if (!firebaseUser) return null;
    const token = await firebaseUser.getIdToken();
    setIdToken(token);
    return token;
  }, [firebaseUser]);

  const usuario = useMemo<UsuarioSesion>(() => {
    if (authMode === 'demo') return demoUsers[rol];
    if (!firebaseUser) return demoUsers.demo;

    const caseRole: RolCaso = miembroCaso && isCaseRole(miembroCaso.rol) ? miembroCaso.rol : 'lector';
    return {
      id: firebaseUser.uid,
      nombre: miembroCaso?.nombre ?? firebaseUser.displayName ?? firebaseUser.email ?? 'Usuario autenticado',
      rol: caseRole,
      organizacion: miembroCaso?.organizacion ?? 'Sesion Firebase',
    };
  }, [authMode, firebaseUser, miembroCaso, rol]);

  const value = useMemo<AuthContextValue>(() => ({
    usuario,
    rol: usuario.rol,
    setRol,
    authMode,
    authReady,
    isAuthenticated: Boolean(firebaseUser),
    firebaseUser,
    idToken,
    miembroCaso,
    authError,
    canEditAuditWork: canRoleEditAuditWork(usuario.rol),
    canRegisterResponse: canRoleRegisterResponse(usuario.rol),
    canReviewResponse: canRoleReviewResponse(usuario.rol),
    canManageMembers: canRoleManageMembers(usuario.rol),
    isReadOnlyDemo: authMode === 'demo' ? usuario.rol === 'demo' : !firebaseUser || usuario.rol === 'lector',
    signIn,
    signOut,
    setCaseMembership,
    refreshIdToken,
  }), [
    authError,
    authMode,
    authReady,
    firebaseUser,
    idToken,
    miembroCaso,
    refreshIdToken,
    setCaseMembership,
    setRol,
    signIn,
    signOut,
    usuario,
  ]);

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
