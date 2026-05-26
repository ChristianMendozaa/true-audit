import { getFirebaseAdminAuth, getFirebaseAdminDb } from '@/lib/firebase/admin';
import { isCaseRole } from '@/lib/auth/permissions';
import type { MiembroCaso, RolCaso } from '@/lib/types';

const CASES_COLLECTION = process.env.FIREBASE_CASES_COLLECTION || 'casos';

export interface AuthenticatedActor {
  uid: string;
  email?: string | null;
  name?: string | null;
}

export interface AuthorizedCaseActor extends AuthenticatedActor {
  rol: RolCaso;
  member: MiembroCaso;
}

export function isFirebaseAuthRequired() {
  return process.env.NEXT_PUBLIC_TRUE_AUDIT_AUTH_MODE === 'firebase';
}

export async function authenticateRequest(request: Request): Promise<AuthenticatedActor | null> {
  const header = request.headers.get('authorization') ?? '';
  const [type, token] = header.split(' ');
  if (type !== 'Bearer' || !token) return null;

  const decoded = await getFirebaseAdminAuth().verifyIdToken(token);
  return {
    uid: decoded.uid,
    email: decoded.email ?? null,
    name: decoded.name ?? null,
  };
}

export async function loadCaseMember(caseId: string, uid: string): Promise<MiembroCaso | null> {
  const db = getFirebaseAdminDb();
  const snapshot = await db.collection(CASES_COLLECTION).doc(caseId).collection('miembros').doc(uid).get();
  if (!snapshot.exists) return null;

  const data = snapshot.data() ?? {};
  const rol = typeof data.rol === 'string' && isCaseRole(data.rol) ? data.rol : null;
  if (!rol) return null;

  return {
    uid,
    email: typeof data.email === 'string' ? data.email : null,
    nombre: typeof data.nombre === 'string' ? data.nombre : null,
    organizacion: typeof data.organizacion === 'string' ? data.organizacion : undefined,
    rol,
    activo: data.activo !== false,
  };
}

export async function authorizeCaseRequest(request: Request, caseId: string): Promise<AuthorizedCaseActor | Response> {
  const actor = await authenticateRequest(request);
  if (!actor) {
    return Response.json({ error: 'Autenticacion requerida.' }, { status: 401 });
  }

  const member = await loadCaseMember(caseId, actor.uid);
  if (!member || member.activo === false) {
    return Response.json({ error: 'El usuario no tiene permisos en este expediente.' }, { status: 403 });
  }

  return {
    ...actor,
    rol: member.rol,
    member: {
      ...member,
      email: member.email ?? actor.email ?? null,
      nombre: member.nombre ?? actor.name ?? actor.email ?? 'Usuario autenticado',
    },
  };
}
