import type { Caso } from '@/lib/types';
import {
  deleteCaseFromFirestore,
  firebaseCasesCollectionName,
  loadCaseFromFirestore,
  saveCaseToFirestore,
} from '@/lib/firebase/case-store';
import { isFirebaseAdminConfigured } from '@/lib/firebase/admin';

export const runtime = 'nodejs';

function firebaseUnavailable() {
  return Response.json({
    error: 'Firebase no esta configurado en el servidor.',
    configured: false,
  }, { status: 503 });
}

export async function GET(_request: Request, { params }: { params: Promise<{ caseId: string }> }) {
  const { caseId } = await params;

  if (!isFirebaseAdminConfigured()) return firebaseUnavailable();

  try {
    const caso = await loadCaseFromFirestore(caseId);
    if (!caso) {
      return Response.json({ caso: null, collection: firebaseCasesCollectionName() }, { status: 404 });
    }
    return Response.json({ caso, collection: firebaseCasesCollectionName() });
  } catch (error) {
    console.error('[true-audit] Error cargando caso desde Firebase', error);
    return Response.json({ error: 'No se pudo cargar el caso desde Firebase.' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ caseId: string }> }) {
  const { caseId } = await params;

  if (!isFirebaseAdminConfigured()) return firebaseUnavailable();

  const body = await request.json() as { caso?: Caso };
  if (!body.caso || body.caso.id !== caseId) {
    return Response.json({ error: 'Caso invalido para persistencia.' }, { status: 400 });
  }

  try {
    await saveCaseToFirestore(body.caso);
    return Response.json({
      ok: true,
      caseId,
      collection: firebaseCasesCollectionName(),
    });
  } catch (error) {
    console.error('[true-audit] Error guardando caso en Firebase', error);
    return Response.json({ error: 'No se pudo guardar el caso en Firebase.' }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ caseId: string }> }) {
  const { caseId } = await params;

  if (!isFirebaseAdminConfigured()) return firebaseUnavailable();

  try {
    await deleteCaseFromFirestore(caseId);
    return Response.json({ ok: true, caseId });
  } catch (error) {
    console.error('[true-audit] Error eliminando caso de Firebase', error);
    return Response.json({ error: 'No se pudo eliminar el caso de Firebase.' }, { status: 500 });
  }
}
