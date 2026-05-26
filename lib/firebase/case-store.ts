import { FieldValue, type DocumentReference, type Firestore, type WriteBatch } from 'firebase-admin/firestore';
import { getFirebaseAdminDb, isFirebaseAdminConfigured } from '@/lib/firebase/admin';
import { summarizeCaseChange } from '@/lib/cases/change-policy';
import { isCaseRole } from '@/lib/auth/permissions';
import type { AuditLogEntry, Caso, MiembroCaso, RolCaso } from '@/lib/types';

const CASES_COLLECTION = process.env.FIREBASE_CASES_COLLECTION || 'casos';

type RecordWithId = { id: string };

export class CaseConflictError extends Error {
  constructor(
    readonly currentRevision: number,
    readonly expectedRevision: number,
  ) {
    super(`El expediente fue actualizado por otra sesion. Revision actual: ${currentRevision}, esperada: ${expectedRevision}.`);
    this.name = 'CaseConflictError';
  }
}

export interface CaseSaveActor {
  uid: string;
  email?: string | null;
  name?: string | null;
  rol: RolCaso;
}

export interface SaveCaseOptions {
  baseRevision?: number;
  actor?: CaseSaveActor;
  action?: string;
  entity?: string;
  summary?: string;
}

export interface CaseMemberInput {
  uid: string;
  email?: string | null;
  nombre?: string | null;
  rol: RolCaso;
  activo?: boolean;
  organizacion?: string;
}

export interface CaseMemberAuditOptions {
  action?: string;
  summary?: string;
}

function requiredDb() {
  if (!isFirebaseAdminConfigured()) {
    throw new Error('Firebase Admin no esta configurado en variables de entorno.');
  }
  return getFirebaseAdminDb();
}

function caseRef(db: Firestore, caseId: string) {
  return db.collection(CASES_COLLECTION).doc(caseId);
}

function nowIso() {
  return new Date().toISOString();
}

function normalizeLoadedCase(caso: Caso | null, revision = 0): Caso | null {
  if (!caso) return null;
  return {
    ...caso,
    revision: caso.revision ?? revision,
  };
}

function toIso(value: unknown) {
  if (value && typeof value === 'object' && 'toDate' in value && typeof value.toDate === 'function') {
    return value.toDate().toISOString();
  }
  return typeof value === 'string' ? value : undefined;
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
  return normalizeLoadedCase((data?.payload ?? null) as Caso | null, Number(data?.revision ?? 0));
}

export async function saveCaseToFirestore(caso: Caso, options: SaveCaseOptions = {}) {
  const db = requiredDb();
  const ref = caseRef(db, caso.id);

  const result = await db.runTransaction(async transaction => {
    const snapshot = await transaction.get(ref);
    const data = snapshot.data();
    const previousCase = snapshot.exists ? normalizeLoadedCase((data?.payload ?? null) as Caso | null, Number(data?.revision ?? 0)) : null;
    const currentRevision = Number(data?.revision ?? previousCase?.revision ?? 0);

    if (typeof options.baseRevision === 'number' && currentRevision !== options.baseRevision) {
      throw new CaseConflictError(currentRevision, options.baseRevision);
    }

    const nextRevision = currentRevision + 1;
    const actor = options.actor;
    const nextCaso: Caso = {
      ...caso,
      revision: nextRevision,
      updatedAt: nowIso(),
      updatedBy: actor?.uid,
    };

    transaction.set(ref, {
      caseId: caso.id,
      numero: caso.numero,
      titulo: caso.titulo,
      banco: caso.banco,
      periodo: caso.periodo,
      estado: caso.estado,
      payload: nextCaso,
      revision: nextRevision,
      schemaVersion: 2,
      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: actor?.uid ?? null,
    }, { merge: true });

    if (actor) {
      const auditRef = ref.collection('auditLog').doc();
      transaction.set(auditRef, {
        id: auditRef.id,
        caseId: caso.id,
        actorUid: actor.uid,
        actorEmail: actor.email ?? null,
        actorName: actor.name ?? actor.email ?? null,
        actorRole: actor.rol,
        action: options.action ?? 'case.update',
        entity: options.entity ?? 'caso',
        summary: options.summary ?? summarizeCaseChange(previousCase, nextCaso),
        revisionBefore: currentRevision,
        revisionAfter: nextRevision,
        createdAt: FieldValue.serverTimestamp(),
      });
    }

    return { caso: nextCaso, revision: nextRevision };
  });

  const batch = db.batch();
  await syncSubcollection(batch, ref, 'evidencias', result.caso.evidencias);
  await syncSubcollection(batch, ref, 'hallazgos', result.caso.hallazgos);
  await syncSubcollection(batch, ref, 'respuestasAuditado', result.caso.respuestasAuditado);
  await syncSubcollection(batch, ref, 'timeline', result.caso.timeline);
  await syncSubcollection(batch, ref, 'nodosTablero', result.caso.nodosTablero);
  await syncSubcollection(batch, ref, 'conexionesTablero', result.caso.conexionesTablero);
  await batch.commit();

  return result;
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

export async function loadCaseMembersFromFirestore(caseId: string): Promise<MiembroCaso[]> {
  const db = requiredDb();
  const snapshot = await caseRef(db, caseId).collection('miembros').orderBy('rol').get();

  const members: MiembroCaso[] = [];
  snapshot.docs.forEach(doc => {
    const data = doc.data();
    const rol = typeof data.rol === 'string' && isCaseRole(data.rol) ? data.rol : null;
    if (!rol) return;

    members.push({
      uid: doc.id,
      rol,
      email: typeof data.email === 'string' ? data.email : null,
      nombre: typeof data.nombre === 'string' ? data.nombre : null,
      organizacion: typeof data.organizacion === 'string' ? data.organizacion : undefined,
      activo: data.activo !== false,
    });
  });

  return members;
}

export async function loadAuditLogFromFirestore(caseId: string, limit = 30): Promise<AuditLogEntry[]> {
  const db = requiredDb();
  const snapshot = await caseRef(db, caseId)
    .collection('auditLog')
    .orderBy('createdAt', 'desc')
    .limit(limit)
    .get();

  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      caseId,
      actorUid: String(data.actorUid ?? ''),
      actorEmail: typeof data.actorEmail === 'string' ? data.actorEmail : null,
      actorName: typeof data.actorName === 'string' ? data.actorName : null,
      actorRole: isCaseRole(data.actorRole) ? data.actorRole : 'lector',
      action: String(data.action ?? 'case.update'),
      entity: String(data.entity ?? 'caso'),
      summary: String(data.summary ?? 'Actualizacion del expediente'),
      revisionBefore: Number(data.revisionBefore ?? 0),
      revisionAfter: Number(data.revisionAfter ?? 0),
      createdAt: toIso(data.createdAt),
    };
  });
}

export async function upsertCaseMemberInFirestore(
  caseId: string,
  input: CaseMemberInput,
  actor: CaseSaveActor,
  auditOptions: CaseMemberAuditOptions = {},
) {
  const db = requiredDb();
  const ref = caseRef(db, caseId);
  const member: MiembroCaso = {
    uid: input.uid,
    email: input.email ?? null,
    nombre: input.nombre ?? null,
    rol: input.rol,
    activo: input.activo !== false,
    organizacion: input.organizacion,
  };

  await db.runTransaction(async transaction => {
    const caseSnapshot = await transaction.get(ref);
    const revision = Number(caseSnapshot.data()?.revision ?? 0);
    const memberRef = ref.collection('miembros').doc(member.uid);
    const auditRef = ref.collection('auditLog').doc();

    transaction.set(memberRef, {
      ...member,
      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: actor.uid,
    }, { merge: true });

    transaction.set(auditRef, {
      id: auditRef.id,
      caseId,
      actorUid: actor.uid,
      actorEmail: actor.email ?? null,
      actorName: actor.name ?? actor.email ?? null,
      actorRole: actor.rol,
      action: auditOptions.action ?? 'member.upsert',
      entity: `miembros/${member.uid}`,
      summary: auditOptions.summary ?? `Alta o actualizacion de miembro ${member.email ?? member.uid} como ${member.rol}`,
      revisionBefore: revision,
      revisionAfter: revision,
      createdAt: FieldValue.serverTimestamp(),
    });
  });

  return member;
}

export async function patchCaseMemberInFirestore(
  caseId: string,
  uid: string,
  patch: Partial<Omit<CaseMemberInput, 'uid'>>,
  actor: CaseSaveActor,
) {
  const db = requiredDb();
  const ref = caseRef(db, caseId);
  let saved: MiembroCaso | null = null;

  await db.runTransaction(async transaction => {
    const caseSnapshot = await transaction.get(ref);
    const revision = Number(caseSnapshot.data()?.revision ?? 0);
    const memberRef = ref.collection('miembros').doc(uid);
    const memberSnapshot = await transaction.get(memberRef);
    if (!memberSnapshot.exists) {
      throw new Error('Miembro no encontrado.');
    }

    const current = memberSnapshot.data() ?? {};
    const currentRole = typeof current.rol === 'string' && isCaseRole(current.rol) ? current.rol : 'lector';
    saved = {
      uid,
      email: patch.email ?? (typeof current.email === 'string' ? current.email : null),
      nombre: patch.nombre ?? (typeof current.nombre === 'string' ? current.nombre : null),
      rol: patch.rol ?? currentRole,
      activo: patch.activo ?? current.activo !== false,
      organizacion: patch.organizacion ?? (typeof current.organizacion === 'string' ? current.organizacion : undefined),
    };

    transaction.set(memberRef, {
      ...saved,
      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: actor.uid,
    }, { merge: true });

    const auditRef = ref.collection('auditLog').doc();
    transaction.set(auditRef, {
      id: auditRef.id,
      caseId,
      actorUid: actor.uid,
      actorEmail: actor.email ?? null,
      actorName: actor.name ?? actor.email ?? null,
      actorRole: actor.rol,
      action: 'member.update',
      entity: `miembros/${uid}`,
      summary: `Actualizacion de miembro ${saved.email ?? uid}`,
      revisionBefore: revision,
      revisionAfter: revision,
      createdAt: FieldValue.serverTimestamp(),
    });
  });

  return saved;
}

export function firebaseCasesCollectionName() {
  return CASES_COLLECTION;
}
