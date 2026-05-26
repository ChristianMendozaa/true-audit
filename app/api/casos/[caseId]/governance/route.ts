import {
  firebaseCasesCollectionName,
  loadAuditLogFromFirestore,
  loadCaseMembersFromFirestore,
} from '@/lib/firebase/case-store';
import { isFirebaseAdminConfigured } from '@/lib/firebase/admin';
import { authorizeCaseRequest, isFirebaseAuthRequired } from '@/lib/firebase/authz';

export const runtime = 'nodejs';

function firebaseUnavailable() {
  return Response.json({
    error: 'Firebase no esta configurado en el servidor.',
    configured: false,
  }, { status: 503 });
}

export async function GET(request: Request, { params }: { params: Promise<{ caseId: string }> }) {
  const { caseId } = await params;
  const url = new URL(request.url);
  const requestedLimit = Number(url.searchParams.get('limit') ?? 30);
  const auditLimit = Number.isFinite(requestedLimit)
    ? Math.min(Math.max(Math.trunc(requestedLimit), 1), 150)
    : 30;

  if (isFirebaseAuthRequired()) {
    const authorization = await authorizeCaseRequest(request, caseId);
    if (authorization instanceof Response) return authorization;
  }

  if (!isFirebaseAdminConfigured()) return firebaseUnavailable();

  try {
    const [members, auditLog] = await Promise.all([
      loadCaseMembersFromFirestore(caseId),
      loadAuditLogFromFirestore(caseId, auditLimit),
    ]);

    return Response.json({
      caseId,
      collection: firebaseCasesCollectionName(),
      members,
      auditLog,
    });
  } catch (error) {
    console.error('[true-audit] Error cargando gobierno del expediente', error);
    return Response.json({ error: 'No se pudo cargar gobierno del expediente.' }, { status: 500 });
  }
}
