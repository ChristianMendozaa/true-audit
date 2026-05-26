# Firebase

True Audit mantiene el modo demo/local como comportamiento por defecto. Cuando `NEXT_PUBLIC_TRUE_AUDIT_STORAGE_MODE=firebase` esta activo, el caso editable se sincroniza con Firestore usando endpoints internos de Next.js y `firebase-admin` del lado servidor.

Para activar autenticacion real y colaboracion, usar ademas `NEXT_PUBLIC_TRUE_AUDIT_AUTH_MODE=firebase`. Si esta variable no existe o vale `demo`, la app conserva el selector local de roles para exposicion academica.

## Variables

Copiar `.env.example` a `.env.local` y completar:

- `NEXT_PUBLIC_TRUE_AUDIT_STORAGE_MODE=firebase`
- `NEXT_PUBLIC_TRUE_AUDIT_AUTH_MODE=firebase`
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`

Las variables publicas del SDK web se usan para Firebase Auth y listeners de Firestore. La escritura protegida sigue pasando por rutas internas server-side para validar permisos y registrar auditoria. Si faltan credenciales, la app sigue abriendo el caso demo con persistencia local.

## Estructura Firestore

La ruta `/api/casos/[caseId]/data` guarda:

- `casos/{caseId}` con metadatos y `payload` completo del caso.
- `casos/{caseId}/evidencias/{id}`
- `casos/{caseId}/hallazgos/{id}`
- `casos/{caseId}/respuestasAuditado/{id}`
- `casos/{caseId}/timeline/{id}`
- `casos/{caseId}/nodosTablero/{id}`
- `casos/{caseId}/conexionesTablero/{id}`
- `casos/{caseId}/miembros/{uid}`
- `casos/{caseId}/auditLog/{eventId}`

En modo demo/local, la app es local-first. En modo Firebase Auth, el usuario autenticado carga la version remota del caso y el servidor valida su membresia antes de permitir lectura/escritura.

## Miembros y roles

Para alta manual, crear usuarios en Firebase Authentication y luego crear un documento:

- Ruta: `casos/{caseId}/miembros/{uid}`
- Campos minimos: `rol`, `email`, `nombre`, `activo`
- Roles validos: `auditor_lider`, `auditor`, `auditado`, `lector`

Desde la app, un usuario con rol `auditor_lider` puede administrar miembros en `Resumen > Gobierno del expediente` y en las secciones `Usuarios y roles` y `Movimientos`. Esas opciones se ocultan del indice si el usuario no tiene rol de lider:

- crear un usuario de Firebase Auth y asignarle rol en el expediente;
- agregar por correo de Firebase Auth o por UID;
- cambiar rol, nombre, organizacion y estado activo;
- desactivar miembros sin borrar el historial;
- registrar cada alta/cambio en `auditLog`.

La creacion desde `Usuarios y roles` usa Firebase Admin del lado servidor. La contrasena temporal se envia a Firebase Auth, pero True Audit no la guarda en Firestore ni en la bitacora. No hay registro abierto ni invitaciones publicas en esta fase.

## Como probar login

1. Activar en `.env` o `.env.local`:
   - `NEXT_PUBLIC_TRUE_AUDIT_AUTH_MODE=firebase`
   - `NEXT_PUBLIC_TRUE_AUDIT_STORAGE_MODE=firebase`
2. Reiniciar el servidor (`npm run dev`).
3. Crear o confirmar un usuario en Firebase Auth.
4. Crear su membresia en `casos/2026-014/miembros/{uid}` con `rol: "auditor_lider"` y `activo: true`, o usar `Usuarios y roles` si ya existe un lider.
5. Abrir `/casos/2026-014`, usar `Iniciar sesion` en la barra superior y entrar con correo/contrasena.
6. Para cerrar sesion, usar el boton `Salir` en la barra superior.

## Reglas academicas minimas

- El rol `auditor_lider` o `auditor` puede editar evidencias, hallazgos, tablero y eventos.
- El rol `auditado` puede registrar respuestas asociadas a hallazgos.
- El rol `lector` puede visualizar sin modificar datos.
- El rol `demo` es sintetico y existe solo para exposicion/local.
- La demo no debe fallar si Firebase no esta configurado.

## Conflictos y auditoria

- Cada guardado usa `revision` como control optimista.
- Si otra sesion guardo antes, la API responde `409` y la app pide recargar la version remota.
- Cada escritura autenticada crea un documento en `auditLog` con usuario, rol, accion, resumen y revision antes/despues.
- La pantalla `Resumen` incluye un panel de gobierno que muestra modo de sesion, rol, revision, miembros autorizados y ultimos cambios cuando Auth real esta activo.

## Adjuntos sin Storage

No se usa Firebase Storage en esta fase. Las evidencias guardan solo metadatos:

- nombre de archivo;
- tipo MIME;
- tamano;
- fecha de modificacion;
- confidencialidad;
- ubicacion/custodia externa;
- hash opcional.

Esto evita costos de Cloud Storage y reduce exposicion de documentos confidenciales. Si se necesita custodiar archivos reales en el futuro, debe agregarse un proveedor opcional con reglas, auditoria de descargas y evaluacion de confidencialidad.

## Estado actual

La aplicacion tiene capa editable local, sincronizacion Firestore, Auth real opcional, roles por expediente, auditoria de cambios, deteccion de conflictos y adjuntos metadata-only. Storage real sigue pendiente por decision de seguridad/costos.
