import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import AuthProvider, { useAuth } from '@/components/auth/AuthProvider';

function RoleProbe() {
  const { rol, setRol, canEditAuditWork, canRegisterResponse, isReadOnlyDemo } = useAuth();

  return (
    <div>
      <div>rol:{rol}</div>
      <div>edita:{String(canEditAuditWork)}</div>
      <div>responde:{String(canRegisterResponse)}</div>
      <div>demo:{String(isReadOnlyDemo)}</div>
      <button type="button" onClick={() => setRol('auditado')}>modo auditado</button>
      <button type="button" onClick={() => setRol('demo')}>modo demo</button>
    </div>
  );
}

describe('AuthProvider', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('inicia como auditor para permitir la demo editable', () => {
    render(
      <AuthProvider>
        <RoleProbe />
      </AuthProvider>
    );

    expect(screen.getByText('rol:auditor')).toBeInTheDocument();
    expect(screen.getByText('edita:true')).toBeInTheDocument();
    expect(screen.getByText('responde:true')).toBeInTheDocument();
  });

  it('cambia a auditado y demo con permisos diferenciados', () => {
    render(
      <AuthProvider>
        <RoleProbe />
      </AuthProvider>
    );

    fireEvent.click(screen.getByText('modo auditado'));
    expect(screen.getByText('rol:auditado')).toBeInTheDocument();
    expect(screen.getByText('edita:false')).toBeInTheDocument();
    expect(screen.getByText('responde:true')).toBeInTheDocument();

    fireEvent.click(screen.getByText('modo demo'));
    expect(screen.getByText('rol:demo')).toBeInTheDocument();
    expect(screen.getByText('demo:true')).toBeInTheDocument();
  });
});
