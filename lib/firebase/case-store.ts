import { FieldValue, type DocumentReference, type Firestore, type WriteBatch } from 'firebase-admin/firestore';
import { getFirebaseAdminDb, isFirebaseAdminConfigured } from '@/lib/firebase/admin';
import type { Caso } from '@/lib/types';

const CASES_COLLECTION = process.env.FIREBASE_CASES_COLLECTION || 'casos';

type RecordWithId = { id: string };

function requiredDb() {
  if (!isFirebaseAdminConfigured()) {
    throw new Error('Firebase Admin no esta configurado en variables de entorno.');
  }
  return getFirebaseAdminDb();
}

function caseRef(db: Firestore, caseId: string) {
  return db.collection(CASES_COLLECTION).doc(caseId);
}

function recordsById<T extends RecordWithId>(items: T[]) {
  return new Map(items.map(item => [item.id, item]));
}

async function syncSubcollection<T extends RecordWithId>(
  batch: WriteBatch,
  parent: DocumentReference,
  name: string,
  items: T[]
) {
  const collection = parent.collection(name);
  const existing = await collection.get();
  const nextRecords = recordsById(items);
  const nextIds = new Set(nextRecords.keys());

  existing.docs.forEach(doc => {
    if (!nextIds.has(doc.id)) batch.delete(doc.ref);
  });

  nextRecords.forEach((item, id) => {
    batch.set(collection.doc(id), {
      ...item,
      updatedAt: FieldValue.serverTimestamp(),
    });
  });
}

export async function loadCaseFromFirestore(caseId: string): Promise<Caso | null> {
  const db = requiredDb();
  const snapshot = await caseRef(db, caseId).get();
  if (!snapshot.exists) return null;

  const data = snapshot.data();
  return (data?.payload ?? null) as Caso | null;
}

export async function saveCaseToFirestore(caso: Caso) {
  const db = requiredDb();
  const ref = caseRef(db, caso.id);
  const batch = db.batch();

  batch.set(ref, {
    caseId: caso.id,
    numero: caso.numero,
    titulo: caso.titulo,
    banco: caso.banco,
    periodo: caso.periodo,
    estado: caso.estado,
    payload: caso,
    schemaVersion: 1,
    updatedAt: FieldValue.serverTimestamp(),
  }, { merge: true });

  await syncSubcollection(batch, ref, 'evidencias', caso.evidencias);
  await syncSubcollection(batch, ref, 'hallazgos', caso.hallazgos);
  await syncSubcollection(batch, ref, 'respuestasAuditado', caso.respuestasAuditado);
  await syncSubcollection(batch, ref, 'timeline', caso.timeline);
  await syncSubcollection(batch, ref, 'nodosTablero', caso.nodosTablero);
  await syncSubcollection(batch, ref, 'conexionesTablero', caso.conexionesTablero);

  await batch.commit();
}

export async function deleteCaseFromFirestore(caseId: string) {
  const db = requiredDb();
  const ref = caseRef(db, caseId);
  const batch = db.batch();

  for (const name of ['evidencias', 'hallazgos', 'respuestasAuditado', 'timeline', 'nodosTablero', 'conexionesTablero']) {
    const existing = await ref.collection(name).get();
    existing.docs.forEach(doc => batch.delete(doc.ref));
  }

  batch.delete(ref);
  await batch.commit();
}

export function firebaseCasesCollectionName() {
  return CASES_COLLECTION;
}
