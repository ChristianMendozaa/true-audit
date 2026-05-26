import { getFirebaseAdminAuth, isFirebaseAdminConfigured } from '@/lib/firebase/admin';
import { authorizeCaseRequest } from '@/lib/firebase/authz';
import { isCaseRole } from '@/lib/auth/permissions';
import { upsertCaseMemberInFirestore } from '@/lib/firebase/case-store';
import type { RolCaso } from '@/lib/types';

export const runtime = 'nodejs';

function firebaseUnavailable() {
  return Response.json({
    error: 'Firebase no esta configurado en el servidor.',
    configured: false,
  }, { status: 503 });
}

function forbiddenUnlessLeader(role: string) {
  if (role === 'auditor_lider') return null;
  return Response.json({ error: 'Solo el auditor lider puede administrar miembros.' }, { status: 403 });
}

export async function POST(request: Request, { params }: { params: Promise<{ caseId: string }> }) {
  const { caseId } = await params;
  const authorization = await authorizeCaseRequest(request, caseId);
  if (authorization instanceof Response) return authorization;

  const forbidden = forbiddenUnlessLeader(authorization.rol);
  if (forbidden) return forbidden;

  if (!isFirebaseAdminConfigured()) return firebaseUnavailable();

  const body = await request.json() as {
    uid?: string;
    email?: string;
    nombre?: string;
    rol?: string;
    activo?: boolean;
    organizacion?: string;
    createAuthUser?: boolean;
    password?: string;
  };

  if (!body.rol || !isCaseRole(body.rol)) {
    return Response.json({ error: 'Rol invalido para el expediente.' }, { status: 400 });
  }

  let uid = body.uid?.trim();
  let email = body.email?.trim() || null;
  let nombre = body.nombre?.trim() || null;
  const shouldCreateAuthUser = body.createAuthUser === true;

  if (shouldCreateAuthUser) {
    if (!email) {
      return Response.json({ error: 'Debes indicar correo para crear el usuario.' }, { status: 400 });
    }

    const password = body.password?.trim() ?? '';
    if (password.length < 6) {
      return Response.json({ error: 'La contrasena temporal debe tener al menos 6 caracteres.' }, { status: 400 });
    }

    try {
      const firebaseUser = await getFirebaseAdminAuth().createUser({
        email,
        password,
        displayName: nombre || undefined,
        disabled: body.activo === false,
      });
      uid = firebaseUser.uid;
      email = firebaseUser.email ?? email;
      nombre = nombre || firebaseUser.displayName || firebaseUser.email || null;
    } catch (error) {
      const code = typeof error === 'object' && error && 'code' in error ? String(error.code) : '';
      if (code === 'auth/email-already-exists') {
        return Response.json({
          error: 'Ya existe un usuario de Firebase Auth con ese correo. Agregalo como miembro existente.',
        }, { status: 409 });
      }

      return Response.json({ error: 'No se pudo crear el usuario en Firebase Auth.' }, { status: 500 });
    }
  }

  if (!uid && email) {
    try {
      const firebaseUser = await getFirebaseAdminAuth().getUserByEmail(email);
      uid = firebaseUser.uid;
      email = firebaseUser.email ?? email;
      nombre = nombre || firebaseUser.displayName || firebaseUser.email || null;
    } catch {
      return Response.json({
        error: 'No existe un usuario de Firebase Auth con ese correo. Crealo primero en Firebase Authentication.',
      }, { status: 404 });
    }
  }

  if (!uid) {
    return Response.json({ error: 'Debes indicar UID o correo de un usuario existente.' }, { status: 400 });
  }

  const member = await upsertCaseMemberInFirestore(caseId, {
    uid,
    email,
    nombre,
    rol: body.rol as RolCaso,
    activo: body.activo !== false,
    organizacion: body.organizacion?.trim() || undefined,
  }, {
    uid: authorization.uid,
    email: authorization.email,
    name: authorization.member.nombre ?? authorization.name,
    rol: authorization.rol,
  }, shouldCreateAuthUser
    ? {
      action: 'user.create',
      summary: `Creacion de usuario ${email ?? uid} y alta como ${body.rol}`,
    }
    : undefined);

  return Response.json({ ok: true, member });
}
