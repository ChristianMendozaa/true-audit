# True Audit — UI Guidelines

Guía visual para nuevas pantallas y componentes de True Audit.

## Dirección visual

True Audit se presenta como un **expediente digital de auditoría forense**: oscuro, sobrio, profesional, con detalles documentales sutiles. No es un dashboard corporativo ni una plantilla SaaS.

### Principios

| Principio | Cómo se aplica |
|---|---|
| **Profesional** | Colores desaturados, bordes finos, tipografía formal |
| **Sobrio** | Sin gradientes vivos, glows decorativos ni animaciones excesivas |
| **Documental** | Usar códigos de caso (H-001, EVD-001), fechas monospace, bordes izquierdos como marca |
| **Intencional** | Cada elemento debe aportar valor informativo. Si parece relleno, se elimina |

### Anti-patrones (NO hacer)

- Tags decorativos sin valor ("Ficha de caso", "EXP", "ALERTA")
- Glow de colores en sombras
- Badges rotados con CSS transform
- Textos genéricos de IA ("Conecta evidencias, hallazgos, criterios…")
- Gradientes en backgrounds de tarjetas
- Animaciones de entrada excesivas

---

## Paleta de colores

Definida en `globals.css` como CSS custom properties:

| Token | Uso |
|---|---|
| `--color-paper` | Background principal (`#0E131B`) |
| `--color-ink` | Texto principal (`#F0E7D6`) |
| `--color-ink-muted` | Texto secundario/metadatos |
| `--color-ink-soft` | Texto de cuerpo, descripciones |
| `--color-signal` | Acentos dorados (`#D8A437`) |
| `--color-rule` | Bordes y separadores |
| `--color-vermilion` | Riesgo alto / alertas |
| `--color-amber-signal` | Advertencias |
| `--color-olive` | Conforme / OK |

### Colores por marco normativo

Usar siempre los tokens `--color-marco-*` (≥ 4.5:1 sobre `--color-paper`):

| Marco | Token | Hex |
|---|---|---|
| COBIT | `text-marco-cobit` | `#6FA8D8` |
| COSO | `text-marco-coso` | `#9E80D8` |
| RGSI | `text-marco-rgsi` / `text-signal` | `#D8A437` |

**No usar** `text-node-doc` / `text-node-interview` como color de texto de marco (fallan WCAG AA).
Esos tokens son para nodos del tablero SVG (contraste relativo al fondo del nodo, no del fondo global).

---

## Tipografía

| Variable | Fuente | Uso |
|---|---|---|
| `--font-display` | Fraunces | Títulos principales y números grandes |
| `--font-mono` | JetBrains Mono | Códigos, fechas, etiquetas uppercase, badges |
| `--font-sans` | Geist | Cuerpo de texto, descripciones, formularios |

### Escala canónica

| Rol | Clase Tailwind / CSS | Notas |
|---|---|---|
| Título de página (h1) | `font-display text-3xl font-bold leading-tight` | Uniforme en todas las pantallas |
| Título de sección (h2) | `font-display text-lg font-semibold` | — |
| Cuerpo / descripción | `text-sm leading-relaxed text-ink-soft` | No usar `text-ink-muted` para prosa |
| Dato / código mono | `font-mono text-xs` (12 px mín.) | Para códigos de hallazgo/evidencia en tablas |
| Eyebrow / header de sección | `.label-eyebrow` (11 px, tracking 0.08em) | Reemplaza la cadena `text-[10px] uppercase tracking-[0.16em]` |
| Label de campo de formulario | `.label-field` (11 px, tracking 0.08em) | Idéntico a eyebrow, semántica diferente |
| Label de métrica / stat / KPI | `.data-label` (11 px, tracking 0.06em) | — |

### Regla de piso tipográfico

> **Ningún contenido informativo debe renderizarse por debajo de 11 px.**
> `MarginNumber` (`aria-hidden`, ornamental) puede quedar en 10 px, pero su uso debe ser escaso.
> Los nodos del tablero SVG pueden usar tamaños más pequeños por limitaciones del canvas; compensar con zoom.

### Reglas adicionales

- Códigos (H-001, EVD-005, COBIT PO1) siempre en `font-mono`
- Títulos de sección en `font-display` con `letter-spacing: 0em`
- Labels de metadatos: usar `.label-eyebrow` — **no** derivar manualmente `font-mono text-[10px] uppercase tracking-[0.16em]`
- Cuerpo de texto: `text-sm`, `leading-relaxed`, `text-ink-soft` (no `text-ink-muted`)

---

## Componentes base

### audit-file-surface
Tarjeta principal del sistema. Background sólido `#101721`, borde fino `rgba(48, 56, 71, 0.7)`, sombra mínima.

```css
.audit-file-surface {
  background: #101721;
  border: 1px solid rgba(48, 56, 71, 0.7);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.18);
}
```

### StatusPill
Badge de estado con dot de color. Usar únicamente para estados del sistema (severidad, respuesta, caso). **No crear variantes decorativas.**

### KpiTile
Métrica compacta. Solo muestra: valor (display), label (text-sm), y sublabel opcional (mono). **Sin tags de tipo ni glow.**

### field-input
Input de formulario. Border sólido, background oscuro, focus con borde signal.

### check-row
Fila de checkbox para checklists (criterios, evidencias). Flex horizontal con gap.

---

## Patrones de layout

### Split view (Hallazgos, Evidencias)
- Panel izquierdo: **tabla densa** con columnas código, título, estado, fecha
- Panel derecho: **detalle completo** del elemento seleccionado, o formulario de edición
- Columnas `xl:grid-cols-[1fr_0.95fr]`

### Tabla densa
- `<table>` con `border-collapse`, `text-left`, `text-sm`
- Header sticky con `bg-[#0B0F15]`, font-mono uppercase
- Filas con hover `bg-paper-warm/50`, selección `bg-paper-warm`

### Sección con label
```html
<div class="mb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-muted">
  Título de sección
</div>
```

### Borde izquierdo (highlight)
Usar `border-l-2 border-vermilion/60 pl-3` para hallazgos críticos, `border-l border-rule pl-3` para items normales.

---

## Navegación

### Sidebar
8 items principales numerados 00-07:
```
00 Resumen
01 Tablero
02 Hallazgos
03 Evidencias
04 Línea de tiempo
05 Aseguramiento
06 Marcos normativos
07 Informe
```

Separador "Administración" visible solo para admins:
```
— Usuarios y roles
— Movimientos
```

### Reglas
- No agregar items sin asignar un código numérico
- No mostrar items admin a usuarios normales
- Kanban es accesible desde un botón en el Tablero, no como item principal

---

## Microcopy

### Reglas
- Todo en español
- Sin textos genéricos de IA
- Preferir lenguaje técnico de auditoría
- "Hallazgo", no "Finding"
- "Evidencia", no "Evidence"
- "Expediente", no "Case"
- "Tablero de trazabilidad", no "Case board"
- "Aseguramiento", no "Quality assurance"

### Textos de vacío
Usar mensajes concretos:
- ✅ "No hay hallazgos críticos pendientes de respuesta."
- ✅ "Todos los hallazgos tienen al menos una evidencia vinculada."
- ❌ "No hay elementos que mostrar."
- ❌ "Aún no se han agregado datos."

---

## Reglas para nuevas pantallas

1. **Header**: Usar `font-display text-3xl font-bold` para el título, con label mono del contexto arriba
2. **No agregar métricas decorativas**: Solo mostrar datos que el usuario necesita para tomar decisiones
3. **Sin modales para CRUD principal**: Usar split view o panel lateral
4. **Filtros**: Bar de botones tipo toggle con `font-mono text-xs`
5. **Tablas sobre tarjetas**: Para listas de más de 5 items, preferir tabla densa
6. **Acciones**: Botones con border sólido, sin rounded, text-sm
