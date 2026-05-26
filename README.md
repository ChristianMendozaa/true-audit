# True Audit

True Audit es una TAAC visual para auditoria de sistemas. Su objetivo es asistir al equipo auditor en el relevamiento, organizacion, trazabilidad y sustentacion de hallazgos, sin reemplazar el juicio profesional del auditor.

La herramienta trabaja como un expediente forense de auditoria: evidencias, documentos, fichas de prueba, hallazgos, criterios COBIT/COSO/RGSI, respuestas del auditado, linea de tiempo, tablero visual e informe imprimible.

## Que problema resuelve

En una auditoria de sistemas, un hallazgo debe poder defenderse. True Audit organiza la cadena:

`evidencia -> observacion/prueba -> hallazgo -> criterio -> riesgo -> recomendacion -> respuesta del auditado`

La app no inventa hallazgos, no evalua documentos automaticamente y no reemplaza el juicio profesional. Ayuda a ordenar, explicar y demostrar trazabilidad.

## Estado funcional actual

- Caso demo `2026-014` con Banco Cordillera S.A.
- Contenido academico alineado a COBIT `PO1`, `PO2`, `PO3`, `PO4`, `PO7`, `ME2`.
- COSO representado por ambiente de control, evaluacion de riesgos, actividades de control, informacion y comunicacion, y supervision.
- RGSI representado por secciones `2`, `6`, `11` y `12`.
- Datos editables en navegador con persistencia en `localStorage`.
- Boton para restaurar el caso demo original.
- CRUD local de evidencias y hallazgos.
- Adjuntos locales de evidencia: guarda metadatos y, si el archivo no supera 2 MB, una copia local descargable.
- Registro de respuestas del auditado desde el detalle de hallazgo.
- Roles simulados: `auditor`, `auditado` y `demo`.
- CaseBoard conectado a datos editables, con toolbar tipo diagramador, paleta de figuras, creacion de nodos, conectores guiados y posiciones persistentes.
- Modulo Kanban del caso para evidencias, hallazgos y respuestas por estado operativo.
- Linea de tiempo conectada al caso editable y alta manual de eventos.
- Informe imprimible desde navegador.
- Exportes academicos: informe final PDF, fichas de hallazgo PDF y matriz COBIT `.xlsx`.
- Suite de pruebas con unit/component/integration/E2E.

## Como ejecutar

```bash
npm install
npm run dev
```

Abrir:

```text
http://localhost:3000/casos/2026-014
```

## Pruebas

```bash
npm run lint
npm run test:unit
npm run build
npm run test:e2e
npm run test:all
```

La suite cubre:

- unitarias de calculo de riesgo;
- unitarias de Kanban y exportes;
- componentes visuales y permisos simulados;
- integracion del caso demo, criterios y relaciones;
- integracion de endpoints internos de PDF/Excel;
- E2E del flujo de exposicion;
- smoke visual de tablero, Kanban e informe;
- checks basicos de accesibilidad, consola y overflow.

## Firebase

La app funciona sin Firebase por defecto. Para activar persistencia Firestore, copiar `.env.example` a `.env.local`, completar las variables y usar:

```env
NEXT_PUBLIC_TRUE_AUDIT_STORAGE_MODE=firebase
```

Con Firebase activo, True Audit guarda el caso completo en `casos/{caseId}` y replica subcolecciones para `evidencias`, `hallazgos`, `respuestasAuditado`, `timeline`, `nodosTablero` y `conexionesTablero`. El modo demo/local sigue funcionando como respaldo si Firebase no esta configurado o falla.

Mas detalle en [docs/firebase.md](docs/firebase.md).

## Flujo sugerido para exposicion

1. Abrir el expediente demo.
2. Mostrar el resumen del caso y metricas.
3. Entrar a evidencias y crear o editar una evidencia.
4. Entrar a hallazgos y revisar un hallazgo critico.
5. Abrir el detalle del hallazgo y explicar condicion, criterio, causa, efecto, conclusion, riesgo y recomendacion.
6. Cambiar a rol `auditado` y registrar o revisar una respuesta.
7. Entrar al tablero visual y seleccionar el hallazgo para mostrar su trazabilidad.
8. Abrir la linea de tiempo para explicar el proceso de auditoria.
9. Abrir el Kanban para explicar el estado operativo de evidencias, hallazgos y respuestas.
10. Abrir el informe e imprimir/guardar como PDF.
11. Descargar informe PDF, fichas de hallazgo PDF y matriz COBIT Excel.

## Limitaciones actuales

- La persistencia Firestore ya existe, pero sigue siendo local-first y sin login real.
- Los roles son simulados, no autenticacion real.
- Los adjuntos locales grandes guardan solo metadatos para no saturar `localStorage`.
- Los PDF y Excel se generan con endpoints internos a partir del caso editable enviado desde el navegador; no usan todavia plantillas DOCX en runtime.

## Trabajo futuro

- Firebase Auth con roles reales.
- Auditoria de cambios por usuario.
- Validaciones mas estrictas por campo.
- Carga real de archivos en Storage.
