import type { Caso } from '@/lib/types';
import { canRolePersistCaseChange, summarizeCaseChange } from '@/lib/cases/change-policy';
import {
  CaseConflictError,
  deleteCaseFromFirestore,
  firebaseCasesCollectionName,
  loadCaseFromFirestore,
  saveCaseToFirestore,
} from '@/lib/firebase/case-store';
import { isFirebaseAdminConfigured } from '@/lib/firebase/admin';
import { authorizeCaseRequest, isFirebaseAuthRequired } from '@/lib/firebase/authz';
import { canRoleEditAuditWork } from '@/lib/auth/permissions';

export const runtime = 'nodejs';

function firebaseUnavailable() {
  return Response.json({
    error: 'Firebase no esta configurado en el servidor.',
    configured: false,
  }, { status: 503 });
}

export async function GET(_request: Request, { params }: { params: Promise<{ caseId: string }> }) {
  const { caseId } = await params;

  try {
    let member = null;
    if (isFirebaseAuthRequired()) {
      const authorization = await authorizeCaseRequest(_request, caseId);
      if (authorization instanceof Response) return authorization;
      member = authorization.member;
    }

    if (!isFirebaseAdminConfigured()) return firebaseUnavailable();

    const caso = await loadCaseFromFirestore(caseId);
    if (!caso) {
      return Response.json({ caso: null, collection: firebaseCasesCollectionName() }, { status: 404 });
    }
    return Response.json({ caso, member, collection: firebaseCasesCollectionName() });
  } catch (error) {
    console.error('[true-audit] Error cargando caso desde Firebase', error);
    return Response.json({ error: 'No se pudo cargar el caso desde Firebase.' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ caseId: string }> }) {
  const { caseId } = await params;

  let authorization = null;
  if (isFirebaseAuthRequired()) {
    const result = await authorizeCaseRequest(request, caseId);
    if (result instanceof Response) return result;
    authorization = result;
  }

  if (!isFirebaseAdminConfigured()) return firebaseUnavailable();

  const body = await request.json() as {
    caso?: Caso;
    baseRevision?: number;
    action?: string;
    entity?: string;
    summary?: string;
  };
  if (!body.caso || body.caso.id !== caseId) {
    return Response.json({ error: 'Caso invalido para persistencia.' }, { status: 400 });
  }

  try {
    const previousCase = await loadCaseFromFirestore(caseId);
    if (authorization && !canRolePersistCaseChange(authorization.rol, previousCase, body.caso)) {
      return Response.json({ error: 'El rol activo no permite este cambio en el expediente.' }, { status: 403 });
    }

    const result = await saveCaseToFirestore(body.caso, {
      baseRevision: body.baseRevision,
      actor: authorization ? {
        uid: authorization.uid,
        email: authorization.email,
        name: authorization.member.nombre ?? authorization.name,
        rol: authorization.rol,
      } : undefined,
      action: body.action,
      entity: body.entity,
      summary: body.summary ?? summarizeCaseChange(previousCase, body.caso),
    });
    return Response.json({
      ok: true,
      caseId,
      caso: result.caso,
      revision: result.revision,
      collection: firebaseCasesCollectionName(),
    });
  } catch (error) {
    if (error instanceof CaseConflictError) {
      return Response.json({
        error: 'El expediente tiene una version mas reciente.',
        conflict: true,
        currentRevision: error.currentRevision,
        expectedRevision: error.expectedRevision,
      }, { status: 409 });
    }
    console.error('[true-audit] Error guardando caso en Firebase', error);
    return Response.json({ error: 'No se pudo guardar el caso en Firebase.' }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ caseId: string }> }) {
  const { caseId } = await params;

  try {
    if (isFirebaseAuthRequired()) {
      const authorization = await authorizeCaseRequest(_request, caseId);
      if (authorization instanceof Response) return authorization;
      if (!canRoleEditAuditWork(authorization.rol)) {
        return Response.json({ error: 'Solo el equipo auditor puede eliminar un expediente.' }, { status: 403 });
      }
    }

    if (!isFirebaseAdminConfigured()) return firebaseUnavailable();

    await deleteCaseFromFirestore(caseId);
    return Response.json({ ok: true, caseId });
  } catch (error) {
    console.error('[true-audit] Error eliminando caso de Firebase', error);
    return Response.json({ error: 'No se pudo eliminar el caso de Firebase.' }, { status: 500 });
  }
}
