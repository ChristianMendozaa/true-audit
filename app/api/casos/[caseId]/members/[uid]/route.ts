import { isFirebaseAdminConfigured } from '@/lib/firebase/admin';
import { authorizeCaseRequest } from '@/lib/firebase/authz';
import { isCaseRole } from '@/lib/auth/permissions';
import { patchCaseMemberInFirestore } from '@/lib/firebase/case-store';
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

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ caseId: string; uid: string }> },
) {
  const { caseId, uid } = await params;
  const authorization = await authorizeCaseRequest(request, caseId);
  if (authorization instanceof Response) return authorization;

  const forbidden = forbiddenUnlessLeader(authorization.rol);
  if (forbidden) return forbidden;

  if (!isFirebaseAdminConfigured()) return firebaseUnavailable();

  const body = await request.json() as {
    email?: string;
    nombre?: string;
    rol?: string;
    activo?: boolean;
    organizacion?: string;
  };

  if (uid === authorization.uid && (body.activo === false || (body.rol && body.rol !== 'auditor_lider'))) {
    return Response.json({ error: 'No puedes quitarte a ti mismo el rol de auditor lider.' }, { status: 400 });
  }

  if (body.rol && !isCaseRole(body.rol)) {
    return Response.json({ error: 'Rol invalido para el expediente.' }, { status: 400 });
  }

  try {
    const member = await patchCaseMemberInFirestore(caseId, uid, {
      email: body.email?.trim() || undefined,
      nombre: body.nombre?.trim() || undefined,
      rol: body.rol as RolCaso | undefined,
      activo: body.activo,
      organizacion: body.organizacion?.trim() || undefined,
    }, {
      uid: authorization.uid,
      email: authorization.email,
      name: authorization.member.nombre ?? authorization.name,
      rol: authorization.rol,
    });

    return Response.json({ ok: true, member });
  } catch {
    return Response.json({ error: 'Miembro no encontrado.' }, { status: 404 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ caseId: string; uid: string }> },
) {
  const { caseId, uid } = await params;
  const authorization = await authorizeCaseRequest(request, caseId);
  if (authorization instanceof Response) return authorization;

  const forbidden = forbiddenUnlessLeader(authorization.rol);
  if (forbidden) return forbidden;

  if (!isFirebaseAdminConfigured()) return firebaseUnavailable();

  if (uid === authorization.uid) {
    return Response.json({ error: 'No puedes desactivarte a ti mismo.' }, { status: 400 });
  }

  try {
    const member = await patchCaseMemberInFirestore(caseId, uid, { activo: false }, {
      uid: authorization.uid,
      email: authorization.email,
      name: authorization.member.nombre ?? authorization.name,
      rol: authorization.rol,
    });
    return Response.json({ ok: true, member });
  } catch {
    return Response.json({ error: 'Miembro no encontrado.' }, { status: 404 });
  }
}
