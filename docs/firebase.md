# Firebase

True Audit mantiene el modo demo/local como comportamiento por defecto. Cuando `NEXT_PUBLIC_TRUE_AUDIT_STORAGE_MODE=firebase` esta activo, el caso editable se sincroniza con Firestore usando endpoints internos de Next.js y `firebase-admin` del lado servidor.

## Variables

Copiar `.env.example` a `.env.local` y completar:

- `NEXT_PUBLIC_TRUE_AUDIT_STORAGE_MODE=firebase`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`

Las variables publicas del SDK web pueden quedar preparadas para fases posteriores, pero la persistencia actual usa la service account server-side. Si faltan credenciales, la app sigue abriendo el caso demo con persistencia local.

## Estructura Firestore

La ruta `/api/casos/[caseId]/data` guarda:

- `casos/{caseId}` con metadatos y `payload` completo del caso.
- `casos/{caseId}/evidencias/{id}`
- `casos/{caseId}/hallazgos/{id}`
- `casos/{caseId}/respuestasAuditado/{id}`
- `casos/{caseId}/timeline/{id}`
- `casos/{caseId}/nodosTablero/{id}`
- `casos/{caseId}/conexionesTablero/{id}`

La app es local-first: si existe una copia en `localStorage`, la usa y luego la sincroniza con Firestore. Si no hay copia local, intenta cargar Firestore. Si el caso no existe en Firestore, siembra el demo.

## Storage sugerido

- `casos/{caseId}/evidencias/{evidenciaId}/{archivo}`

## Reglas academicas minimas

- El rol `auditor` puede editar evidencias, hallazgos, tablero y eventos.
- El rol `auditado` puede registrar respuestas asociadas a hallazgos.
- El rol `demo` puede visualizar el caso sin modificar datos.
- La demo no debe fallar si Firebase no esta configurado.

## Estado actual

La aplicacion ya tiene una capa editable local con sincronizacion Firestore para casos, evidencias, hallazgos, respuestas, nodos, conexiones y eventos. Storage y autenticacion real siguen pendientes.
