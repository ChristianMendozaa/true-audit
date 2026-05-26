# True Audit - Roadmap MVP

Fecha de revision: 2026-05-25.

True Audit ya funciona como MVP local para exposicion academica: expediente demo editable, tablero visual conectado, evidencias, hallazgos, respuestas, Kanban, linea de tiempo, informe, fichas PDF y matriz COBIT Excel.

## Avance por fases

- Fase 1 completada: auditoria tecnica y estructura documentada.
- Fase 2 completada: contenido academico alineado a COBIT `PO1`, `PO2`, `PO3`, `PO4`, `PO7`, `ME2`; COSO; RGSI secciones `2`, `6`, `11`, `12`.
- Fase 3 completada: capa local editable con `localStorage` y restauracion del demo.
- Fase 4 completada: CRUD local de evidencias, asociaciones y nodos de tablero.
- Fase 5 completada: CRUD local de hallazgos, asociaciones y riesgo por probabilidad x impacto.
- Fase 6 completada: respuestas del auditado y decision del auditor.
- Fase 7 completada en MVP: CaseBoard conectado a datos editables, toolbar tipo diagramador, paleta de figuras, posiciones persistentes y relaciones nuevas.
- Fase 8 completada en MVP: linea de tiempo con eventos automaticos y manuales.
- Fase 9 completada en MVP: informe imprimible.
- Fase 10 completada en MVP: matriz COBIT nativa `.xlsx` con formulas, estilos y estructura academica.
- Fase 11 completada en modo local: adjuntos de evidencias con metadatos y copia local descargable hasta 2 MB.
- Fase 12 completada parcialmente: sincronizacion Firestore local-first para caso, evidencias, hallazgos, respuestas, timeline, nodos y conexiones; Storage/Auth pendientes.
- Fase 13 completada en modo simulado: roles `auditor`, `auditado` y `demo` con permisos basicos.
- Fase 14 completada en MVP: revision del flujo completo de exposicion.
- Fase 15 completada en MVP: documentacion final actualizada.
- Fase 16 completada: pruebas automatizadas y control de calidad final.
- Entrega complementaria completada: modulo Kanban y exportes PDF/Excel basados en los documentos academicos de referencia.
- Refinamiento posterior completado: informe final, fichas U2 y matriz COBIT ajustados contra `docs/Informe_Final_Auditoria_RGSI_COBIT_Banco_Debilidad_HISTORIAL (1).docx`, `docs/U2 Hallazgos y Controles Cobit  (Encontrados) (3).docx` y `docs/matriz cobit.xlsx`.

## Estructura que conviene mantener

- `lib/types.ts`: contratos principales de caso, evidencia, hallazgo, respuesta, tablero, timeline y roles.
- `lib/mock-data.ts`: caso demo `2026-014`.
- `lib/frameworks.ts`: catalogo COBIT/COSO/RGSI.
- `lib/risk.ts`: calculo simple de riesgo.
- `components/data/CaseDataProvider.tsx`: store editable local-first con sincronizacion opcional a Firestore.
- `components/auth/AuthProvider.tsx`: sesion simulada para auditor, auditado y demo.
- `components/visual/EvidenceBoard.tsx`: tablero visual.
- `components/cases/*`: pantallas cliente conectadas a datos editables.
- `lib/kanban.ts`: derivacion de tarjetas y columnas Kanban desde el caso editable.
- `lib/exports/*`: generacion de informe PDF, fichas PDF y matriz COBIT Excel.
- `app/api/casos/[caseId]/data`: endpoint interno de persistencia Firestore.
- `app/api/casos/[caseId]/exports/*`: endpoints internos de exportacion por POST.
- `tests/*`: pruebas unitarias, componentes, integracion y E2E.

## Fase 16 - Pruebas y QA final

Objetivo: demostrar que el MVP no solo se ve bien, sino que el flujo de exposicion funciona de punta a punta.

Pruebas incluidas:

- `npm run lint`: calidad estatica.
- `npm run test:unit`: unit/component/integration con Vitest.
- `npm run build`: compilacion Next.js y TypeScript.
- `npm run test:e2e`: Playwright sobre navegador real.
- `npm run test:all`: suite completa en orden recomendado.

Cobertura funcional:

- calculo de riesgo;
- contenido academico del caso demo;
- integridad de relaciones evidencia/hallazgo/criterio/tablero;
- render de sellos visuales;
- mapeo de Kanban;
- generacion de matriz COBIT `.xlsx`;
- endpoints internos de informe PDF, fichas PDF y matriz Excel;
- roles simulados;
- flujo de crear evidencia;
- flujo de crear hallazgo;
- registro de respuesta del auditado;
- bloqueo de edicion en modo demo;
- tablero con nodos visibles;
- tablero tipo diagramador con creacion de nodo y conexion guiada;
- Kanban con cambio de estado por drag and drop;
- informe con exportacion PDF, fichas PDF, matriz Excel e impresion;
- consola sin errores, overflow horizontal y botones con nombre accesible.

## Pendiente despues del MVP local

1. Completar Firebase:
   - Auth para correo/contrasena.
   - Permisos por rol real.
   - Storage para archivos reales.
2. Agregar auditoria de cambios por usuario.
3. Fortalecer validaciones y permisos por rol real.
4. Preparar despliegue o build de presentacion.
5. Evaluar generacion DOCX si se requiere entregar documentos editables, no solo PDF/Excel.

## Decision tecnica vigente

Mantener el stack actual de Next.js App Router. El MVP debe seguir abriendo en modo demo aunque no exista backend, Firebase ni credenciales. La persistencia real se agrega como adaptador posterior, no como requisito para mostrar la herramienta en clase.
