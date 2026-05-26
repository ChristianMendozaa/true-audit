'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import type { Caso, ConexionTablero, FiguraNodo, NodoTablero, Severidad, TipoNodo, TipoRelacion } from '@/lib/types';
import { getCriterioById } from '@/lib/frameworks';
import NodeShape from './NodeShape';
import ConnectionLine from './ConnectionLine';

interface EvidenceBoardProps {
  nodos: NodoTablero[];
  conexiones: ConexionTablero[];
  caso: Caso;
  canEdit?: boolean;
  onNodosChange?: (nodos: NodoTablero[]) => void;
  onAddNode?: (node: Omit<NodoTablero, 'id'> & { id?: string }) => NodoTablero;
  onDeleteNode?: (id: string) => void;
  onAddConnection?: (
    desde: string,
    hacia: string,
    etiqueta: TipoRelacion,
    options?: Partial<ConexionTablero>,
  ) => ConexionTablero;
  onDeleteConnection?: (id: string) => void;
}

const NODE_W = 172;
const NODE_H = 86;

type FilterTipo = TipoNodo | null;
type FilterMarco = 'COBIT' | 'COSO' | 'RGSI' | null;
type BoardMode = 'select' | 'pan' | 'create' | 'connect' | 'delete';
interface DraftBoardNode {
  x: number;
  y: number;
  tipo: TipoNodo;
  shape: FiguraNodo;
  titulo: string;
  refId: string;
  severidad: Severidad;
}

const tipoLabels: Record<TipoNodo, string> = {
  documento: 'Doc',
  evidencia: 'Evid.',
  entrevista: 'Entrev.',
  prueba: 'Prueba',
  hallazgo: 'Hallazgo',
  criterio: 'Criterio',
  respuesta: 'Respuesta',
  observacion: 'Obs.',
};

const tipoLongLabels: Record<TipoNodo, string> = {
  documento: 'Documento',
  evidencia: 'Evidencia técnica',
  entrevista: 'Entrevista',
  prueba: 'Ficha de prueba',
  hallazgo: 'Hallazgo',
  criterio: 'Criterio normativo',
  respuesta: 'Respuesta auditado',
  observacion: 'Observacion',
};

const tipoColors: Record<TipoNodo, string> = {
  documento: '#6FA8D8',
  evidencia: '#5CB7E8',
  entrevista: '#9E80D8',
  prueba: '#74C7A6',
  hallazgo: '#F06A49',
  criterio: '#D8AD4C',
  respuesta: '#70C9AC',
  observacion: '#D8A437',
};

const relationLegend = [
  { key: 'respalda', color: '#62A9D8', dash: '', label: 'Respalda' },
  { key: 'origina', color: '#74C7A6', dash: '3 3', label: 'Origina' },
  { key: 'incumple', color: '#F06A49', dash: '', label: 'Incumple' },
  { key: 'relacionado con', color: '#D8AD4C', dash: '9 4', label: 'Criterio' },
  { key: 'responde', color: '#70C9AC', dash: '2 4', label: 'Responde' },
  { key: 'contradice', color: '#F06A49', dash: '8 3 2 3', label: 'Contradice' },
  { key: 'mitiga', color: '#78A85A', dash: '', label: 'Mitiga' },
  { key: 'requiere seguimiento', color: '#D8A437', dash: '5 5', label: 'Seguimiento' },
];

const relationTypes: TipoRelacion[] = [
  'respalda',
  'origina',
  'incumple',
  'relacionado con',
  'responde',
  'contradice',
  'mitiga',
  'requiere seguimiento',
];

const shapeByTipo: Record<TipoNodo, FiguraNodo> = {
  documento: 'documento',
  evidencia: 'rectangulo',
  entrevista: 'nota',
  prueba: 'cilindro',
  hallazgo: 'rombo',
  criterio: 'badge',
  respuesta: 'nota',
  observacion: 'nota',
};

const shapeLabels: Record<FiguraNodo, string> = {
  documento: 'Documento',
  rectangulo: 'Rectangulo',
  rombo: 'Rombo',
  nota: 'Nota',
  cilindro: 'Cilindro',
  badge: 'Norma',
};

const modeLabels: Record<BoardMode, string> = {
  select: 'Seleccionar',
  pan: 'Mover tablero',
  create: 'Crear figura',
  connect: 'Conectar',
  delete: 'Eliminar',
};

const typeHelp: Array<{ tipo: TipoNodo; description: string }> = [
  { tipo: 'documento', description: 'Documento formal revisado: politicas, actas, contratos, manuales o informes.' },
  { tipo: 'evidencia', description: 'Soporte tecnico o documental que respalda una observacion o hallazgo.' },
  { tipo: 'entrevista', description: 'Registro de relevamiento con responsables del banco o terceros.' },
  { tipo: 'prueba', description: 'Ficha de trabajo o procedimiento aplicado por el auditor.' },
  { tipo: 'hallazgo', description: 'Debilidad sustentada con condicion, criterio, causa, efecto, riesgo y recomendacion.' },
  { tipo: 'criterio', description: 'Referencia COBIT, COSO o RGSI usada para evaluar el control.' },
  { tipo: 'respuesta', description: 'Descargo, aceptacion o posicion del auditado frente al hallazgo.' },
  { tipo: 'observacion', description: 'Nota de analisis previa que puede originar o complementar un hallazgo.' },
];

const severityClasses: Record<string, string> = {
  critico: 'border-ember/50 bg-ember/15 text-ember',
  medio: 'border-signal/50 bg-signal/15 text-signal',
  bajo: 'border-olive/50 bg-olive/15 text-olive',
};

const responseClasses: Record<string, string> = {
  pendiente: 'border-ember/45 bg-ember/10 text-ember',
  recibida: 'border-node-doc/45 bg-node-doc/10 text-node-doc',
  aceptada: 'border-node-response/45 bg-node-response/10 text-node-response',
  parcial: 'border-signal/45 bg-signal/10 text-signal',
  rechazada: 'border-ember/45 bg-ember/10 text-ember',
};

export default function EvidenceBoard({
  nodos: initialNodos,
  conexiones,
  caso,
  canEdit = true,
  onNodosChange,
  onAddNode,
  onDeleteNode,
  onAddConnection,
  onDeleteConnection,
}: EvidenceBoardProps) {
  const [nodos, setNodos] = useState<NodoTablero[]>(initialNodos);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedConnectionId, setSelectedConnectionId] = useState<string | null>(null);
  const [hoveredConnectionId, setHoveredConnectionId] = useState<string | null>(null);
  const [filterTipo, setFilterTipo] = useState<FilterTipo>(null);
  const [filterMarco, setFilterMarco] = useState<FilterMarco>(null);
  const [mode, setMode] = useState<BoardMode>('select');
  const [paletteTipo, setPaletteTipo] = useState<TipoNodo>('evidencia');
  const [paletteShape, setPaletteShape] = useState<FiguraNodo>('rectangulo');
  const [connectFromId, setConnectFromId] = useState<string | null>(null);
  const [connectRelation, setConnectRelation] = useState<TipoRelacion>('respalda');
  const [connectionStyle, setConnectionStyle] = useState<'curva' | 'recta' | 'ortogonal'>('curva');
  const [snapGrid, setSnapGrid] = useState(true);
  const [draftNode, setDraftNode] = useState<DraftBoardNode | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [pan, setPan] = useState({ x: 60, y: 40 });
  const [zoom, setZoom] = useState(0.72);
  const [isPanning, setIsPanning] = useState(false);
  const draggingRef = useRef<{ id: string; startX: number; startY: number; origX: number; origY: number } | null>(null);
  const panningRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);
  const latestNodosRef = useRef<NodoTablero[]>(initialNodos);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    latestNodosRef.current = initialNodos;
    queueMicrotask(() => setNodos(initialNodos));
  }, [initialNodos]);

  useEffect(() => {
    latestNodosRef.current = nodos;
  }, [nodos]);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const f = e.deltaY > 0 ? 0.92 : 1.08;
      setZoom(z => Math.min(Math.max(z * f, 0.25), 2.5));
    };
    svg.addEventListener('wheel', onWheel, { passive: false });
    return () => svg.removeEventListener('wheel', onWheel);
  }, []);

  const nodeById = useMemo(() => new Map(nodos.map(n => [n.id, n])), [nodos]);
  const selectedNodo = selectedId ? nodeById.get(selectedId) ?? null : null;
  const selectedConnection = selectedConnectionId
    ? conexiones.find(conn => conn.id === selectedConnectionId) ?? null
    : null;
  const hoveredConnection = hoveredConnectionId
    ? conexiones.find(conn => conn.id === hoveredConnectionId) ?? null
    : null;

  const traceFocus = useMemo(() => {
    const nodeIds = new Set<string>();
    const connectionIds = new Set<string>();

    if (selectedId) {
      nodeIds.add(selectedId);
      conexiones.forEach(conn => {
        if (conn.desde === selectedId || conn.hacia === selectedId) {
          connectionIds.add(conn.id);
          nodeIds.add(conn.desde);
          nodeIds.add(conn.hacia);
        }
      });
    }

    if (selectedConnection) {
      connectionIds.add(selectedConnection.id);
      nodeIds.add(selectedConnection.desde);
      nodeIds.add(selectedConnection.hacia);
    }

    if (hoveredConnection) {
      connectionIds.add(hoveredConnection.id);
      nodeIds.add(hoveredConnection.desde);
      nodeIds.add(hoveredConnection.hacia);
    }

    if (connectFromId) {
      nodeIds.add(connectFromId);
    }

    return { nodeIds, connectionIds };
  }, [conexiones, connectFromId, hoveredConnection, selectedConnection, selectedId]);

  const hasTraceFocus = selectedId !== null || selectedConnection !== null || hoveredConnection !== null || connectFromId !== null;

  const isNodeVisible = useCallback((nodo: NodoTablero) => {
    if (filterTipo && nodo.tipo !== filterTipo) return false;
    if (filterMarco && nodo.tipo === 'criterio') {
      const upper = nodo.titulo.toUpperCase();
      if (!upper.includes(filterMarco)) return false;
    }
    return true;
  }, [filterTipo, filterMarco]);

  const selectPaletteTipo = (tipo: TipoNodo) => {
    setPaletteTipo(tipo);
    setPaletteShape(shapeByTipo[tipo]);
    setMode('create');
  };

  const toBoardPoint = (clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const rect = svg.getBoundingClientRect();
    const rawX = (clientX - rect.left - pan.x) / zoom;
    const rawY = (clientY - rect.top - pan.y) / zoom;
    if (!snapGrid) return { x: rawX, y: rawY };
    return {
      x: Math.round(rawX / 20) * 20,
      y: Math.round(rawY / 20) * 20,
    };
  };

  const createDraftNode = (clientX: number, clientY: number) => {
    const point = toBoardPoint(clientX, clientY);
    const nextIndex = nodos.length + 1;
    setDraftNode({
      x: point.x - NODE_W / 2,
      y: point.y - NODE_H / 2,
      tipo: paletteTipo,
      shape: paletteShape,
      titulo: tipoLongLabels[paletteTipo],
      refId: `MAN-${String(nextIndex).padStart(3, '0')}`,
      severidad: 'medio',
    });
    setSelectedId(null);
    setSelectedConnectionId(null);
  };

  const saveDraftNode = () => {
    if (!draftNode || !canEdit || !onAddNode) return;
    const saved = onAddNode({
      tipo: draftNode.tipo,
      shape: draftNode.shape,
      titulo: draftNode.titulo.trim() || tipoLongLabels[draftNode.tipo],
      subtitulo: draftNode.refId.trim() || 'Nodo manual',
      refId: draftNode.refId.trim() || `MAN-${String(nodos.length + 1).padStart(3, '0')}`,
      x: draftNode.x,
      y: draftNode.y,
      severidad: draftNode.tipo === 'hallazgo' ? draftNode.severidad : undefined,
    });
    setDraftNode(null);
    setSelectedId(saved.id);
    setSelectedConnectionId(null);
    setMode('select');
  };

  const deleteSelection = () => {
    if (!canEdit) return;
    if (selectedConnectionId) {
      onDeleteConnection?.(selectedConnectionId);
      setSelectedConnectionId(null);
      return;
    }
    if (selectedId) {
      onDeleteNode?.(selectedId);
      setSelectedId(null);
    }
  };

  const beginPan = (e: React.PointerEvent<SVGSVGElement>) => {
    panningRef.current = { startX: e.clientX, startY: e.clientY, origX: pan.x, origY: pan.y };
    setIsPanning(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerDownNode = (e: React.PointerEvent<SVGGElement>, id: string) => {
    e.stopPropagation();
    const nodo = nodos.find(n => n.id === id);
    if (!nodo) return;
    setSelectedId(id);
    setSelectedConnectionId(null);

    if (mode === 'connect') {
      if (!connectFromId) {
        setConnectFromId(id);
      } else if (connectFromId !== id && canEdit) {
        const saved = onAddConnection?.(connectFromId, id, connectRelation, {
          estilo: connectionStyle,
          flecha: true,
        });
        setConnectFromId(id);
        if (saved) {
          setSelectedConnectionId(saved.id);
          setSelectedId(null);
        }
      }
      return;
    }

    if (mode === 'delete') {
      if (canEdit && !nodo.locked) {
        onDeleteNode?.(id);
        setSelectedId(null);
      }
      return;
    }

    if (mode !== 'select' || !canEdit || nodo.locked) return;

    draggingRef.current = { id, startX: e.clientX, startY: e.clientY, origX: nodo.x, origY: nodo.y };
    (e.currentTarget as SVGGElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMoveSVG = (e: React.PointerEvent<SVGSVGElement>) => {
    if (draggingRef.current) {
      const d = draggingRef.current;
      const dx = (e.clientX - d.startX) / zoom;
      const dy = (e.clientY - d.startY) / zoom;
      setNodos(prev => prev.map(n => n.id === d.id ? { ...n, x: d.origX + dx, y: d.origY + dy } : n));
    }
    if (panningRef.current) {
      const p = panningRef.current;
      setPan({ x: p.origX + (e.clientX - p.startX), y: p.origY + (e.clientY - p.startY) });
    }
  };

  const handlePointerUpSVG = () => {
    if (draggingRef.current) {
      onNodosChange?.(latestNodosRef.current);
    }
    draggingRef.current = null;
    panningRef.current = null;
    setIsPanning(false);
  };

  const handlePointerDownSVG = (e: React.PointerEvent<SVGSVGElement>) => {
    if (mode === 'create' && canEdit) {
      createDraftNode(e.clientX, e.clientY);
      return;
    }

    const target = e.target as SVGElement;
    const isBackground = target === svgRef.current || target.classList.contains('board-bg-rect');
    if (isBackground) {
      setSelectedId(null);
      setSelectedConnectionId(null);
      if (mode === 'connect') {
        setConnectFromId(null);
      }
      if (mode === 'pan' || mode === 'select' || e.button === 1) {
        beginPan(e);
      }
    }
  };

  const selectedHallazgo = selectedNodo?.tipo === 'hallazgo'
    ? caso.hallazgos.find(h => h.id === selectedNodo.refId) ?? null
    : null;
  const selectedEvidencia = selectedNodo && ['documento', 'evidencia', 'entrevista', 'prueba'].includes(selectedNodo.tipo)
    ? caso.evidencias.find(e => e.id === selectedNodo.refId) ?? null
    : null;

  const MINIMAP_W = 170;
  const MINIMAP_H = 108;
  const allX = nodos.map(n => n.x);
  const allY = nodos.map(n => n.y);
  const minX = Math.min(...allX) - 20;
  const minY = Math.min(...allY) - 20;
  const maxX = Math.max(...allX) + NODE_W + 20;
  const maxY = Math.max(...allY) + NODE_H + 20;
  const mmScaleX = MINIMAP_W / (maxX - minX);
  const mmScaleY = MINIMAP_H / (maxY - minY);
  const mmScale = Math.min(mmScaleX, mmScaleY);

  const filterTipos: TipoNodo[] = ['documento', 'evidencia', 'entrevista', 'prueba', 'hallazgo', 'criterio', 'respuesta', 'observacion'];
  const filterMarcos: Array<'COBIT' | 'COSO' | 'RGSI'> = ['COBIT', 'COSO', 'RGSI'];

  return (
    <div className="forensic-board relative w-full h-full overflow-hidden select-none" style={{ background: '#090D12' }}>
      <div className="pointer-events-none absolute inset-0 z-0 forensic-board-atmosphere" />

      <BoardToolbar
        mode={mode}
        canEdit={canEdit}
        paletteTipo={paletteTipo}
        paletteShape={paletteShape}
        connectRelation={connectRelation}
        connectionStyle={connectionStyle}
        snapGrid={snapGrid}
        onModeChange={nextMode => {
          setMode(nextMode);
          setDraftNode(null);
          if (nextMode !== 'connect') setConnectFromId(null);
        }}
        onSelectTipo={selectPaletteTipo}
        onShapeChange={setPaletteShape}
        onRelationChange={setConnectRelation}
        onConnectionStyleChange={setConnectionStyle}
        onSnapGridChange={setSnapGrid}
        onDeleteSelection={deleteSelection}
        onShowHelp={() => setShowHelp(true)}
        hasSelection={Boolean(selectedId || selectedConnectionId)}
      />

      <div className="absolute top-4 left-28 z-20 flex max-w-[calc(100%-520px)] flex-col gap-2">
        <div className="inline-flex w-fit items-center gap-2 border border-wire/80 bg-slate-dark/90 px-3 py-2 shadow-[0_12px_30px_rgba(0,0,0,0.32)] backdrop-blur">
          <span className="h-2 w-2 rounded-full bg-ember shadow-[0_0_12px_rgba(240,106,73,0.65)]" />
          <span
            className="font-mono text-[10px] uppercase tracking-[0.14em] text-bone-muted"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            Case board forense
          </span>
          <span
            className="font-mono text-[10px] text-bone"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            {caso.numero}
          </span>
          <span className="h-4 w-px bg-wire/80" />
          <span
            className="font-mono text-[9px] uppercase tracking-[0.12em] text-bone-muted"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            {nodos.length} nodos / {conexiones.length} relaciones
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <FilterBtn
            active={filterTipo === null}
            onClick={() => setFilterTipo(null)}
            label="Todo"
          />
          {filterTipos.map(t => (
            <TypeFilterBtn
              key={t}
              active={filterTipo === t}
              onClick={() => setFilterTipo(filterTipo === t ? null : t)}
              tipo={t}
            />
          ))}
        </div>
        <div className="flex gap-1.5">
          {filterMarcos.map(m => (
            <FilterBtn
              key={m}
              active={filterMarco === m}
              onClick={() => {
                setFilterTipo(filterTipo === 'criterio' ? 'criterio' : null);
                setFilterMarco(filterMarco === m ? null : m);
              }}
              label={m}
              mono
              color="#D8AD4C"
            />
          ))}
        </div>
      </div>

      <div className="absolute top-4 right-4 z-20 flex flex-col gap-1.5">
        <button
          onClick={() => setZoom(z => Math.min(z + 0.1, 2.5))}
          className="flex h-8 w-8 items-center justify-center border border-wire bg-slate-dark/95 text-sm font-semibold text-bone transition-colors hover:border-signal hover:text-signal"
          title="Acercar"
        >
          +
        </button>
        <button
          onClick={() => setZoom(z => Math.max(z - 0.1, 0.25))}
          className="flex h-8 w-8 items-center justify-center border border-wire bg-slate-dark/95 text-sm font-semibold text-bone transition-colors hover:border-signal hover:text-signal"
          title="Alejar"
        >
          -
        </button>
        <button
          onClick={() => { setPan({ x: 60, y: 40 }); setZoom(0.72); }}
          className="mt-1 flex h-8 w-8 items-center justify-center border border-wire bg-slate-dark/95 text-bone-muted transition-colors hover:border-signal hover:text-signal"
          title="Restablecer vista"
        >
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
            <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.4" />
            <circle cx="6.5" cy="6.5" r="1.5" fill="currentColor" />
          </svg>
        </button>
        <div
          className="text-center font-mono text-[9px] text-bone-muted"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          {Math.round(zoom * 100)}%
        </div>
      </div>

      <svg
        ref={svgRef}
        className="relative z-10 h-full w-full"
        data-testid="case-board-canvas"
        style={{
          cursor: isPanning
            ? 'grabbing'
            : mode === 'create'
              ? 'crosshair'
              : mode === 'connect'
                ? 'cell'
                : mode === 'delete'
                  ? 'not-allowed'
                  : mode === 'pan'
                    ? 'grab'
                    : 'grab',
        }}
        onPointerDown={handlePointerDownSVG}
        onPointerMove={handlePointerMoveSVG}
        onPointerUp={handlePointerUpSVG}
        onPointerLeave={handlePointerUpSVG}
      >
        <defs>
          <pattern
            id="finegrid"
            width="32"
            height="32"
            patternUnits="userSpaceOnUse"
            patternTransform={`translate(${pan.x % 32},${pan.y % 32})`}
          >
            <path d="M 32 0 L 0 0 0 32" fill="none" stroke="#1D2633" strokeWidth="0.55" opacity="0.7" />
          </pattern>
          <pattern
            id="majorgrid"
            width="160"
            height="160"
            patternUnits="userSpaceOnUse"
            patternTransform={`translate(${pan.x % 160},${pan.y % 160})`}
          >
            <path d="M 160 0 L 0 0 0 160" fill="none" stroke="#334052" strokeWidth="0.85" opacity="0.55" />
          </pattern>
          <linearGradient id="boardShade" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#131923" stopOpacity="0.62" />
            <stop offset="50%" stopColor="#090D12" stopOpacity="0" />
            <stop offset="100%" stopColor="#05070B" stopOpacity="0.72" />
          </linearGradient>
        </defs>

        <rect width="100%" height="100%" fill="#090D12" className="board-bg-rect" />
        <rect width="100%" height="100%" fill="url(#finegrid)" className="board-bg-rect" />
        <rect width="100%" height="100%" fill="url(#majorgrid)" className="board-bg-rect" />
        <rect width="100%" height="100%" fill="url(#boardShade)" pointerEvents="none" />

        <g transform={`translate(${pan.x},${pan.y}) scale(${zoom})`}>
          {conexiones.map(conn => {
            const from = nodeById.get(conn.desde);
            const to = nodeById.get(conn.hacia);
            if (!from || !to) return null;
            const fromVisible = isNodeVisible(from);
            const toVisible = isNodeVisible(to);
            const filterDimmed = (filterTipo || filterMarco) ? !fromVisible || !toVisible : false;
            const traceDimmed = hasTraceFocus && !traceFocus.connectionIds.has(conn.id);
            const isSelectedTrace = traceFocus.connectionIds.has(conn.id);
            const isHovered = hoveredConnectionId === conn.id;

            return (
              <ConnectionLine
                key={conn.id}
                x1={from.x + NODE_W / 2}
                y1={from.y + NODE_H / 2}
                x2={to.x + NODE_W / 2}
                y2={to.y + NODE_H / 2}
                label={conn.etiqueta}
                estilo={conn.estilo ?? 'curva'}
                flecha={conn.flecha ?? true}
                dimmed={filterDimmed || traceDimmed}
                selected={isSelectedTrace && !filterDimmed}
                hovered={isHovered}
                onPointerDown={e => {
                  e.stopPropagation();
                  if (mode === 'delete' && canEdit) {
                    onDeleteConnection?.(conn.id);
                    return;
                  }
                  setSelectedConnectionId(conn.id);
                  setSelectedId(null);
                }}
                onPointerEnter={() => setHoveredConnectionId(conn.id)}
                onPointerLeave={() => setHoveredConnectionId(null)}
              />
            );
          })}

          {nodos.map((nodo, i) => {
            const visible = isNodeVisible(nodo);
            const filterDimmed = (filterTipo || filterMarco) ? !visible : false;
            const traceDimmed = hasTraceFocus && !traceFocus.nodeIds.has(nodo.id);
            const opacity = filterDimmed ? 0.08 : traceDimmed ? 0.18 : 1;
            const related = hasTraceFocus && traceFocus.nodeIds.has(nodo.id) && selectedId !== nodo.id;

            return (
              <g
                key={nodo.id}
                transform={`translate(${nodo.x},${nodo.y})`}
                onPointerDown={e => handlePointerDownNode(e, nodo.id)}
                className="board-node"
                style={{
                  opacity,
                  cursor: mode === 'connect' ? 'cell' : mode === 'delete' ? 'not-allowed' : canEdit ? 'grab' : 'pointer',
                  animationDelay: `${i * 22}ms`,
                }}
              >
                <NodeShape
                  tipo={nodo.tipo}
                  titulo={nodo.titulo}
                  subtitulo={nodo.subtitulo}
                  code={nodo.refId}
                  selected={selectedId === nodo.id}
                  related={related}
                  width={NODE_W}
                  height={NODE_H}
                  severidad={nodo.severidad}
                  shape={nodo.shape}
                />
              </g>
            );
          })}

          {draftNode && (
            <g transform={`translate(${draftNode.x},${draftNode.y})`} opacity={0.82} pointerEvents="none">
              <NodeShape
                tipo={draftNode.tipo}
                titulo={draftNode.titulo}
                subtitulo={draftNode.refId}
                code={draftNode.refId}
                selected
                related={false}
                width={NODE_W}
                height={NODE_H}
                severidad={draftNode.tipo === 'hallazgo' ? draftNode.severidad : undefined}
                shape={draftNode.shape}
              />
            </g>
          )}
        </g>
      </svg>

      {mode === 'connect' && (
        <div className="absolute left-1/2 top-4 z-20 hidden -translate-x-1/2 border border-signal/35 bg-[#111721]/95 px-4 py-2 shadow-[0_14px_34px_rgba(0,0,0,0.32)] backdrop-blur lg:block">
          <div
            className="font-mono text-[9px] uppercase tracking-[0.16em] text-signal"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            Modo conectar
          </div>
          <div className="mt-1 text-xs text-bone-muted">
            {connectFromId
              ? `Origen seleccionado: ${nodeById.get(connectFromId)?.refId ?? connectFromId}. Ahora elige destino.`
              : 'Elige un nodo origen para iniciar la relacion.'}
          </div>
        </div>
      )}

      {draftNode && (
        <DraftNodePanel
          draft={draftNode}
          onChange={setDraftNode}
          onSave={saveDraftNode}
          onCancel={() => setDraftNode(null)}
        />
      )}

      {showHelp && <BoardHelpModal onClose={() => setShowHelp(false)} />}

      {(selectedNodo || selectedConnection) && (
        <DetailPanel
          caso={caso}
          nodo={selectedNodo}
          connection={selectedConnection}
          nodeById={nodeById}
          onClose={() => {
            setSelectedId(null);
            setSelectedConnectionId(null);
          }}
        />
      )}

      <div
        className="absolute bottom-4 left-4 z-20 overflow-hidden border border-wire bg-slate-dark/90 shadow-[0_12px_30px_rgba(0,0,0,0.35)] backdrop-blur"
        style={{ width: MINIMAP_W, height: MINIMAP_H }}
      >
        <svg width={MINIMAP_W} height={MINIMAP_H} viewBox={`0 0 ${MINIMAP_W} ${MINIMAP_H}`}>
          {nodos.map(nodo => {
            const mx = (nodo.x - minX) * mmScale;
            const my = (nodo.y - minY) * mmScale;
            const mw = NODE_W * mmScale;
            const mh = NODE_H * mmScale;
            return (
              <rect
                key={nodo.id}
                x={mx}
                y={my}
                width={Math.max(mw, 3)}
                height={Math.max(mh, 2)}
                fill={tipoColors[nodo.tipo]}
                opacity={isNodeVisible(nodo) ? 0.88 : 0.18}
                rx={1}
              />
            );
          })}
        </svg>
        <div
          className="absolute bottom-1 right-1.5 font-mono text-[7px] text-bone-muted"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          MAPA
        </div>
      </div>

      {selectedHallazgo && (
        <div className="pointer-events-none absolute left-1/2 top-4 z-20 hidden -translate-x-1/2 border border-ember/35 bg-[#160C0A]/90 px-4 py-2 shadow-[0_0_26px_rgba(240,106,73,0.18)] backdrop-blur lg:block">
          <div
            className="font-mono text-[9px] uppercase tracking-[0.18em] text-ember"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            Hallazgo en foco
          </div>
          <div className="mt-1 max-w-[420px] truncate text-xs font-semibold text-bone">
            {selectedHallazgo.numero} - {selectedHallazgo.titulo}
          </div>
        </div>
      )}

      {selectedEvidencia && (
        <div className="pointer-events-none absolute left-1/2 top-4 z-20 hidden -translate-x-1/2 border border-node-doc/35 bg-[#0C1420]/90 px-4 py-2 shadow-[0_0_24px_rgba(98,169,216,0.12)] backdrop-blur lg:block">
          <div
            className="font-mono text-[9px] uppercase tracking-[0.18em] text-node-doc"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            Evidencia en revisión
          </div>
          <div className="mt-1 max-w-[420px] truncate text-xs font-semibold text-bone">
            {selectedEvidencia.id} - {selectedEvidencia.titulo}
          </div>
        </div>
      )}
    </div>
  );
}

function FilterBtn({
  active,
  onClick,
  label,
  mono,
  color = '#E4B33A',
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  mono?: boolean;
  color?: string;
}) {
  return (
    <button
      onClick={onClick}
      className="border px-2.5 py-1 text-[10px] transition-all"
      style={{
        fontFamily: mono ? 'var(--font-mono)' : 'var(--font-sans)',
        letterSpacing: mono ? '0.08em' : undefined,
        borderColor: active ? color : 'rgba(58,68,85,0.92)',
        background: active ? `${color}22` : 'rgba(23,27,35,0.88)',
        color: active ? '#F8F0DC' : '#A89E8A',
        boxShadow: active ? `0 0 18px ${color}22` : 'none',
      }}
    >
      {label}
    </button>
  );
}

function TypeFilterBtn({ active, onClick, tipo }: { active: boolean; onClick: () => void; tipo: TipoNodo }) {
  const color = tipoColors[tipo];
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Filtrar ${tipoLongLabels[tipo]}`}
      title={`Filtrar ${tipoLongLabels[tipo]}`}
      className="flex h-8 w-8 items-center justify-center border transition-all"
      style={{
        borderColor: active ? color : 'rgba(58,68,85,0.92)',
        background: active ? `${color}24` : 'rgba(23,27,35,0.88)',
        color: active ? '#F8F0DC' : '#A89E8A',
        boxShadow: active ? `0 0 18px ${color}22` : 'none',
      }}
    >
      <TypeIcon tipo={tipo} />
    </button>
  );
}

function BoardToolbar({
  mode,
  canEdit,
  paletteTipo,
  paletteShape,
  connectRelation,
  connectionStyle,
  snapGrid,
  onModeChange,
  onSelectTipo,
  onShapeChange,
  onRelationChange,
  onConnectionStyleChange,
  onSnapGridChange,
  onDeleteSelection,
  onShowHelp,
  hasSelection,
}: {
  mode: BoardMode;
  canEdit: boolean;
  paletteTipo: TipoNodo;
  paletteShape: FiguraNodo;
  connectRelation: TipoRelacion;
  connectionStyle: 'curva' | 'recta' | 'ortogonal';
  snapGrid: boolean;
  onModeChange: (mode: BoardMode) => void;
  onSelectTipo: (tipo: TipoNodo) => void;
  onShapeChange: (shape: FiguraNodo) => void;
  onRelationChange: (relation: TipoRelacion) => void;
  onConnectionStyleChange: (style: 'curva' | 'recta' | 'ortogonal') => void;
  onSnapGridChange: (enabled: boolean) => void;
  onDeleteSelection: () => void;
  onShowHelp: () => void;
  hasSelection: boolean;
}) {
  const palette: TipoNodo[] = ['documento', 'evidencia', 'prueba', 'hallazgo', 'criterio', 'respuesta', 'observacion'];
  const shapes: FiguraNodo[] = ['documento', 'rectangulo', 'rombo', 'nota', 'cilindro', 'badge'];

  return (
    <div className="absolute left-4 top-4 z-30 w-20 border border-wire bg-[#101721]/95 p-2 shadow-[0_18px_42px_rgba(0,0,0,0.38)] backdrop-blur">
      <div
        className="mb-2 text-center font-mono text-[8px] uppercase tracking-[0.12em] text-bone-muted"
        style={{ fontFamily: 'var(--font-mono)' }}
      >
        Editor
      </div>

      <div className="grid grid-cols-2 gap-1">
        {(['select', 'pan', 'create', 'connect'] as BoardMode[]).map(item => (
          <ToolButton
            key={item}
            active={mode === item}
            disabled={!canEdit && item !== 'select' && item !== 'pan'}
            title={modeLabels[item]}
            onClick={() => onModeChange(item)}
          >
            {toolIcon(item)}
          </ToolButton>
        ))}
        <ToolButton
          active={mode === 'delete'}
          disabled={!canEdit}
          title="Eliminar"
          onClick={() => onModeChange('delete')}
        >
          {toolIcon('delete')}
        </ToolButton>
        <ToolButton
          active={false}
          disabled={!canEdit || !hasSelection}
          title="Eliminar seleccionado"
          onClick={onDeleteSelection}
        >
          <span aria-hidden="true">X</span>
        </ToolButton>
      </div>

      <button
        type="button"
        onClick={onShowHelp}
        className="mt-2 flex h-7 w-full items-center justify-center border border-wire bg-[#0A0D12]/80 font-mono text-[12px] font-bold text-signal transition-colors hover:border-signal hover:text-bone"
        style={{ fontFamily: 'var(--font-mono)' }}
        aria-label="Ver guia de simbolos"
        title="Ver guia de simbolos"
      >
        !
      </button>

      <div className="mt-3 border-t border-wire pt-2">
        <label
          className="block font-mono text-[8px] uppercase tracking-[0.12em] text-bone-muted"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          Figura
        </label>
        <div className="mt-1 grid grid-cols-2 gap-1">
          {palette.map(tipo => (
            <button
              key={tipo}
              type="button"
              disabled={!canEdit}
              onClick={() => onSelectTipo(tipo)}
              className="flex h-8 items-center justify-center border text-[8px] font-semibold uppercase transition-colors disabled:cursor-not-allowed disabled:opacity-40"
              style={{
                borderColor: paletteTipo === tipo ? tipoColors[tipo] : '#2A3140',
                color: paletteTipo === tipo ? '#F8F0DC' : '#A89E8A',
                background: paletteTipo === tipo ? `${tipoColors[tipo]}24` : 'rgba(9,13,18,0.7)',
                fontFamily: 'var(--font-mono)',
              }}
              title={`Crear ${tipoLongLabels[tipo]}`}
            >
              <TypeIcon tipo={tipo} />
            </button>
          ))}
        </div>

        <select
          value={paletteShape}
          onChange={event => onShapeChange(event.target.value as FiguraNodo)}
          disabled={!canEdit}
          className="mt-2 w-full border border-wire bg-[#0A0D12] px-1 py-1 text-[9px] text-bone"
          style={{ fontFamily: 'var(--font-mono)' }}
          aria-label="Seleccionar forma del nodo"
        >
          {shapes.map(shape => (
            <option key={shape} value={shape}>{shapeLabels[shape]}</option>
          ))}
        </select>
      </div>

      <div className="mt-3 border-t border-wire pt-2">
        <label
          className="block font-mono text-[8px] uppercase tracking-[0.12em] text-bone-muted"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          Relacion
        </label>
        <select
          value={connectRelation}
          onChange={event => onRelationChange(event.target.value as TipoRelacion)}
          disabled={!canEdit}
          className="mt-1 w-full border border-wire bg-[#0A0D12] px-1 py-1 text-[9px] text-bone"
          style={{ fontFamily: 'var(--font-mono)' }}
          aria-label="Seleccionar tipo de relacion"
        >
          {relationTypes.map(relation => (
            <option key={relation} value={relation}>{relation}</option>
          ))}
        </select>
        <select
          value={connectionStyle}
          onChange={event => onConnectionStyleChange(event.target.value as 'curva' | 'recta' | 'ortogonal')}
          disabled={!canEdit}
          className="mt-1 w-full border border-wire bg-[#0A0D12] px-1 py-1 text-[9px] text-bone"
          style={{ fontFamily: 'var(--font-mono)' }}
          aria-label="Seleccionar estilo de conector"
        >
          <option value="curva">Curva</option>
          <option value="recta">Directa</option>
          <option value="ortogonal">Ortogonal</option>
        </select>
      </div>

      <label className="mt-3 flex items-center gap-1.5 border-t border-wire pt-2 text-[9px] text-bone-muted">
        <input
          type="checkbox"
          checked={snapGrid}
          onChange={event => onSnapGridChange(event.target.checked)}
          className="h-3 w-3 accent-[#D8A437]"
        />
        Snap
      </label>
    </div>
  );
}

function DraftNodePanel({
  draft,
  onChange,
  onSave,
  onCancel,
}: {
  draft: DraftBoardNode;
  onChange: (draft: DraftBoardNode) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="absolute left-28 bottom-4 z-30 w-80 border border-signal/35 bg-[#101721]/96 p-4 shadow-[0_20px_50px_rgba(0,0,0,0.42)] backdrop-blur">
      <div
        className="font-mono text-[9px] uppercase tracking-[0.16em] text-signal"
        style={{ fontFamily: 'var(--font-mono)' }}
      >
        Nueva figura
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <label className="col-span-2 text-[10px] uppercase tracking-[0.12em] text-bone-muted">
          Titulo
          <input
            value={draft.titulo}
            onChange={event => onChange({ ...draft, titulo: event.target.value })}
            className="field-input mt-1 py-2 text-xs"
            aria-label="Titulo de nodo"
          />
        </label>
        <label className="text-[10px] uppercase tracking-[0.12em] text-bone-muted">
          Codigo / ref
          <input
            value={draft.refId}
            onChange={event => onChange({ ...draft, refId: event.target.value })}
            className="field-input mt-1 py-2 text-xs"
            aria-label="Codigo de nodo"
          />
        </label>
        <label className="text-[10px] uppercase tracking-[0.12em] text-bone-muted">
          Tipo
          <select
            value={draft.tipo}
            onChange={event => {
              const tipo = event.target.value as TipoNodo;
              onChange({ ...draft, tipo, shape: shapeByTipo[tipo] });
            }}
            className="field-input mt-1 py-2 text-xs"
            aria-label="Tipo de nodo"
          >
            {Object.keys(tipoLabels).map(tipo => (
              <option key={tipo} value={tipo}>{tipoLongLabels[tipo as TipoNodo]}</option>
            ))}
          </select>
        </label>
        {draft.tipo === 'hallazgo' && (
          <label className="col-span-2 text-[10px] uppercase tracking-[0.12em] text-bone-muted">
            Severidad
            <select
              value={draft.severidad}
              onChange={event => onChange({ ...draft, severidad: event.target.value as Severidad })}
              className="field-input mt-1 py-2 text-xs"
              aria-label="Severidad de nodo"
            >
              <option value="critico">Critico</option>
              <option value="medio">Medio</option>
              <option value="bajo">Bajo</option>
            </select>
          </label>
        )}
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="border border-wire px-3 py-2 text-xs text-bone-muted transition-colors hover:border-bone hover:text-bone"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={onSave}
          className="border border-signal/45 bg-signal/10 px-3 py-2 text-xs font-semibold text-signal transition-colors hover:border-signal"
        >
          Crear nodo
        </button>
      </div>
    </div>
  );
}

function ToolButton({
  active,
  disabled,
  title,
  onClick,
  children,
}: {
  active: boolean;
  disabled?: boolean;
  title: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      aria-label={title}
      title={title}
      onClick={onClick}
      className="flex h-8 w-8 items-center justify-center border text-[10px] font-bold transition-all disabled:cursor-not-allowed disabled:opacity-35"
      style={{
        borderColor: active ? '#D8A437' : '#2A3140',
        background: active ? 'rgba(216,164,55,0.16)' : 'rgba(9,13,18,0.74)',
        color: active ? '#F8F0DC' : '#A89E8A',
        boxShadow: active ? '0 0 16px rgba(216,164,55,0.16)' : 'none',
        fontFamily: 'var(--font-mono)',
      }}
    >
      {children}
    </button>
  );
}

function toolIcon(mode: BoardMode) {
  const common = { stroke: 'currentColor', strokeWidth: 1.6, fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  if (mode === 'select') {
    return (
      <svg width="15" height="15" viewBox="0 0 15 15" aria-hidden="true">
        <path d="M3 2l8 5-3.4 1.1L9.4 12 7.7 12.8 5.8 9 3 11Z" {...common} />
      </svg>
    );
  }
  if (mode === 'pan') {
    return (
      <svg width="15" height="15" viewBox="0 0 15 15" aria-hidden="true">
        <path d="M7.5 2v11M2 7.5h11M4 4l-2 3.5L4 11M11 4l2 3.5L11 11" {...common} />
      </svg>
    );
  }
  if (mode === 'create') {
    return (
      <svg width="15" height="15" viewBox="0 0 15 15" aria-hidden="true">
        <rect x="2.5" y="2.5" width="10" height="10" rx="1.5" {...common} />
        <path d="M7.5 5v5M5 7.5h5" {...common} />
      </svg>
    );
  }
  if (mode === 'connect') {
    return (
      <svg width="15" height="15" viewBox="0 0 15 15" aria-hidden="true">
        <circle cx="4" cy="4" r="2" {...common} />
        <circle cx="11" cy="11" r="2" {...common} />
        <path d="M5.5 5.5l4 4" {...common} />
      </svg>
    );
  }
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" aria-hidden="true">
      <path d="M4 4l7 7M11 4l-7 7" {...common} />
    </svg>
  );
}

function TypeIcon({ tipo }: { tipo: TipoNodo }) {
  const common = { stroke: 'currentColor', strokeWidth: 1.55, fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  if (tipo === 'documento') {
    return (
      <svg width="15" height="15" viewBox="0 0 15 15" aria-hidden="true">
        <path d="M4 2.2h4.6L11 4.6v8.2H4Z" {...common} />
        <path d="M8.6 2.2v2.5H11M5.6 7h3.8M5.6 9.2h3.8" {...common} />
      </svg>
    );
  }
  if (tipo === 'evidencia') {
    return (
      <svg width="15" height="15" viewBox="0 0 15 15" aria-hidden="true">
        <rect x="2.5" y="3" width="10" height="8.5" rx="1.4" {...common} />
        <path d="M4.2 5.2h6.6M4.2 7.4h4.2M10.2 9.7l1.5 1.5" {...common} />
      </svg>
    );
  }
  if (tipo === 'entrevista') {
    return (
      <svg width="15" height="15" viewBox="0 0 15 15" aria-hidden="true">
        <path d="M3 4.5a2.2 2.2 0 0 1 2.2-2.2h4.6A2.2 2.2 0 0 1 12 4.5v2.1a2.2 2.2 0 0 1-2.2 2.2H7l-2.8 2.4V8.8A2.2 2.2 0 0 1 3 6.6Z" {...common} />
        <path d="M5.2 5.2h4.6M5.2 7h3.1" {...common} />
      </svg>
    );
  }
  if (tipo === 'prueba') {
    return (
      <svg width="15" height="15" viewBox="0 0 15 15" aria-hidden="true">
        <path d="M5.3 2.3h4.4M6 2.3v3.4L3.4 11a1.2 1.2 0 0 0 1.1 1.7h6a1.2 1.2 0 0 0 1.1-1.7L9 5.7V2.3" {...common} />
        <path d="M5 9h5" {...common} />
      </svg>
    );
  }
  if (tipo === 'hallazgo') {
    return (
      <svg width="15" height="15" viewBox="0 0 15 15" aria-hidden="true">
        <path d="M7.5 2.2 13 12H2Z" {...common} />
        <path d="M7.5 5.3v3.2M7.5 10.5h.01" {...common} />
      </svg>
    );
  }
  if (tipo === 'criterio') {
    return (
      <svg width="15" height="15" viewBox="0 0 15 15" aria-hidden="true">
        <path d="M3.3 2.4h8.4v10.2H3.3Z" {...common} />
        <path d="M5 4.8h5M5 7.2h5M5 9.6h3.2" {...common} />
      </svg>
    );
  }
  if (tipo === 'respuesta') {
    return (
      <svg width="15" height="15" viewBox="0 0 15 15" aria-hidden="true">
        <path d="M3 3.4h9v6.2H7.4L4.5 12V9.6H3Z" {...common} />
        <path d="m5.3 6.5 1.4 1.3 3-3" {...common} />
      </svg>
    );
  }
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" aria-hidden="true">
      <path d="M4 3h7v8H4Z" {...common} />
      <path d="M5.5 5.2h4M5.5 7.2h4M5.5 9.2h2.5" {...common} />
    </svg>
  );
}

function BoardHelpModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/58 px-4 backdrop-blur-sm">
      <div className="max-h-[82dvh] w-full max-w-3xl overflow-y-auto border border-wire bg-[#101721]/98 p-5 shadow-[0_28px_80px_rgba(0,0,0,0.62)]">
        <div className="mb-4 flex items-start justify-between gap-4 border-b border-wire pb-4">
          <div>
            <div
              className="font-mono text-[10px] uppercase tracking-[0.18em] text-signal"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              Guia de simbolos del tablero
            </div>
            <h2 className="mt-1 text-xl font-semibold text-bone" style={{ fontFamily: 'var(--font-display)' }}>
              Como leer el expediente visual
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center border border-wire text-bone-muted transition-colors hover:border-signal hover:text-signal"
            aria-label="Cerrar guia de simbolos"
            title="Cerrar"
          >
            X
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {typeHelp.map(item => (
            <div key={item.tipo} className="flex gap-3 border border-wire/80 bg-[#0A0D12]/75 p-3">
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center border"
                style={{ borderColor: `${tipoColors[item.tipo]}88`, color: tipoColors[item.tipo], background: `${tipoColors[item.tipo]}18` }}
              >
                <TypeIcon tipo={item.tipo} />
              </div>
              <div>
                <div className="text-sm font-semibold text-bone">{tipoLongLabels[item.tipo]}</div>
                <p className="mt-1 text-xs leading-relaxed text-bone-muted">{item.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 border-t border-wire pt-4">
          <div
            className="mb-3 font-mono text-[10px] uppercase tracking-[0.16em] text-bone-muted"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            Relaciones
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {relationLegend.map(item => (
              <div key={item.key} className="flex items-center gap-3 text-xs text-bone-muted">
                <svg width="54" height="12" aria-hidden="true">
                  <line
                    x1="2"
                    y1="6"
                    x2="52"
                    y2="6"
                    stroke={item.color}
                    strokeWidth="1.8"
                    strokeDasharray={item.dash}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="font-semibold text-bone">{item.label}</span>
                <span>{relationNarrative(item.key).replace(/\.$/, '')}.</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailPanel({
  caso,
  nodo,
  connection,
  nodeById,
  onClose,
}: {
  caso: Caso;
  nodo: NodoTablero | null;
  connection: ConexionTablero | null;
  nodeById: Map<string, NodoTablero>;
  onClose: () => void;
}) {
  const hallazgo = nodo?.tipo === 'hallazgo'
    ? caso.hallazgos.find(h => h.id === nodo.refId) ?? null
    : null;
  const evidencia = nodo && ['documento', 'evidencia', 'entrevista', 'prueba'].includes(nodo.tipo)
    ? caso.evidencias.find(e => e.id === nodo.refId) ?? null
    : null;
  const criterio = nodo?.tipo === 'criterio' ? getCriterioById(nodo.refId) : undefined;
  const respuestaAuditado = nodo?.tipo === 'respuesta'
    ? caso.respuestasAuditado.find(r => r.id === nodo.refId) ?? null
    : null;
  const respuestaHallazgo = respuestaAuditado
    ? caso.hallazgos.find(h => h.id === respuestaAuditado.hallazgoId) ?? null
    : null;
  const linkedConnections = nodo
    ? caso.conexionesTablero.filter(conn => conn.desde === nodo.id || conn.hacia === nodo.id)
    : [];
  const hallazgosDeEvidencia = evidencia
    ? caso.hallazgos.filter(h => h.evidencias.includes(evidencia.id))
    : [];
  const hallazgosDeCriterio = criterio
    ? caso.hallazgos.filter(h => h.criterios.includes(criterio.id))
    : [];
  const fromNode = connection ? nodeById.get(connection.desde) : null;
  const toNode = connection ? nodeById.get(connection.hacia) : null;
  const title = connection ? 'Relación de trazabilidad' : nodo?.titulo ?? '';
  const code = connection ? connection.id : nodo?.refId ?? '';
  const panelType = connection ? normalizeRelation(connection.etiqueta).toUpperCase() : nodo ? tipoLongLabels[nodo.tipo] : '';
  const accent = connection ? relationColor(connection.etiqueta) : nodo ? tipoColors[nodo.tipo] : '#D8AD4C';

  return (
    <aside className="absolute right-0 top-0 z-30 h-full w-[380px] overflow-y-auto border-l border-wire bg-[#111721]/96 shadow-[-22px_0_50px_rgba(0,0,0,0.46)] backdrop-blur animate-slide-in-right">
      <div className="sticky top-0 z-10 border-b border-wire bg-[#111721]/95 px-5 py-4 backdrop-blur">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div
              className="font-mono text-[9px] uppercase tracking-[0.18em] text-bone-muted"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              Expediente del tablero
            </div>
            <h2
              className="mt-2 line-clamp-2 text-base font-semibold leading-snug text-bone"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center border border-wire text-bone-muted transition-colors hover:border-signal hover:text-signal"
            title="Cerrar detalle"
          >
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
              <line x1="4" y1="4" x2="11" y2="11" stroke="currentColor" strokeWidth="1.5" />
              <line x1="11" y1="4" x2="4" y2="11" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </button>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span
            className="border px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.1em]"
            style={{ borderColor: accent, color: '#F8F0DC', background: `${accent}1C`, fontFamily: 'var(--font-mono)' }}
          >
            {code}
          </span>
          <span
            className="font-mono text-[10px] uppercase tracking-[0.1em] text-bone-muted"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            {panelType}
          </span>
        </div>
      </div>

      <div className="space-y-5 px-5 py-5">
        {connection && (
          <>
            <PanelSection title="Ruta seleccionada">
              <RouteEndpoint label="Origen" nodo={fromNode} />
              <div className="my-3 flex items-center gap-3">
                <span className="h-px flex-1" style={{ background: accent }} />
                <span
                  className="border px-2 py-1 font-mono text-[9px] uppercase tracking-[0.12em] text-bone"
                  style={{ borderColor: accent, background: `${accent}1A`, fontFamily: 'var(--font-mono)' }}
                >
                  {normalizeRelation(connection.etiqueta)}
                </span>
                <span className="h-px flex-1" style={{ background: accent }} />
              </div>
              <RouteEndpoint label="Destino" nodo={toNode} />
            </PanelSection>
            <PanelSection title="Lectura auditora">
              <p className="text-xs leading-relaxed text-bone-muted">
                {relationNarrative(connection.etiqueta)}
              </p>
            </PanelSection>
          </>
        )}

        {hallazgo && (
          <>
            <div className="grid grid-cols-2 gap-2">
              <MetricChip label="Severidad" value={hallazgo.severidad} className={severityClasses[hallazgo.severidad]} />
              <MetricChip label="Respuesta" value={hallazgo.estadoRespuesta} className={responseClasses[hallazgo.estadoRespuesta]} />
              <MetricChip label="Evidencias" value={String(hallazgo.evidencias.length)} />
              <MetricChip label="Criterios" value={String(hallazgo.criterios.length)} />
            </div>
            <PanelSection title="Condición">
              <p className="text-xs leading-relaxed text-bone">{hallazgo.condicion}</p>
            </PanelSection>
            <PanelSection title="Trazabilidad del hallazgo">
              <TraceList
                title="Evidencias que lo respaldan"
                items={hallazgo.evidencias.map(id => {
                  const ev = caso.evidencias.find(e => e.id === id);
                  return { id, label: ev?.titulo ?? id };
                })}
              />
              <TraceList
                title="Criterios aplicados"
                items={hallazgo.criterios.map(id => {
                  const c = getCriterioById(id);
                  return { id, label: c ? `${c.marco} ${c.codigo} - ${c.nombre}` : id };
                })}
              />
              <TraceList
                title="Respuesta del auditado"
                items={[{
                  id: hallazgo.estadoRespuesta,
                  label: hallazgo.respuestaBanco ?? 'Sin respuesta registrada al cierre del trabajo de campo',
                }]}
              />
            </PanelSection>
            <PanelSection title="Acciones">
              <a
                href={`/casos/${caso.id}/hallazgos/${hallazgo.id}`}
                className="inline-flex border border-signal/40 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-signal transition-colors hover:border-bone hover:text-bone"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                Ver ficha completa
              </a>
            </PanelSection>
          </>
        )}

        {evidencia && (
          <>
            <PanelSection title="Descripción">
              <p className="text-xs leading-relaxed text-bone">{evidencia.descripcion}</p>
            </PanelSection>
            <PanelSection title="Fuente y soporte">
              <div className="space-y-1 text-xs text-bone-muted">
                <p>{evidencia.fuente}</p>
                <p
                  className="font-mono text-[10px] uppercase tracking-[0.1em]"
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  {evidencia.fecha}
                  {evidencia.formato ? ` / ${evidencia.formato}` : ''}
                  {evidencia.paginas ? ` / ${evidencia.paginas} págs.` : ''}
                </p>
              </div>
            </PanelSection>
            <PanelSection title="Hallazgos vinculados">
              <TraceList
                items={hallazgosDeEvidencia.map(h => ({ id: h.numero, label: h.titulo }))}
                empty="Esta evidencia aún no respalda un hallazgo."
              />
            </PanelSection>
          </>
        )}

        {criterio && (
          <>
            <div className="grid grid-cols-2 gap-2">
              <MetricChip label="Marco" value={criterio.marco} />
              <MetricChip label="Código" value={criterio.codigo} />
            </div>
            <PanelSection title={criterio.dominio ?? 'Referencia normativa'}>
              <p className="text-sm font-semibold leading-snug text-bone">{criterio.nombre}</p>
              <p className="mt-2 text-xs leading-relaxed text-bone-muted">{criterio.descripcion}</p>
            </PanelSection>
            <PanelSection title="Hallazgos que lo aplican">
              <TraceList
                items={hallazgosDeCriterio.map(h => ({ id: h.numero, label: h.titulo }))}
                empty="No hay hallazgos vinculados en este caso."
              />
            </PanelSection>
          </>
        )}

        {respuestaHallazgo && (
          <>
            <div className="grid grid-cols-2 gap-2">
              <MetricChip label="Hallazgo" value={respuestaHallazgo.numero} />
              <MetricChip label="Estado" value={respuestaHallazgo.estadoRespuesta} className={responseClasses[respuestaHallazgo.estadoRespuesta]} />
            </div>
            <PanelSection title="Respuesta del auditado">
              {respuestaAuditado ? (
                <div className="space-y-2">
                  <p className="text-xs leading-relaxed text-bone">{respuestaAuditado.argumento}</p>
                  {respuestaAuditado.evidenciaPresentada && (
                    <p className="text-xs leading-relaxed text-bone-muted">
                      Evidencia presentada: {respuestaAuditado.evidenciaPresentada}
                    </p>
                  )}
                  <p className="text-xs leading-relaxed text-bone-muted">
                    Decision auditor: {respuestaAuditado.decisionAuditor}
                  </p>
                </div>
              ) : respuestaHallazgo.respuestaBanco ? (
                <p className="text-xs leading-relaxed text-bone">{respuestaHallazgo.respuestaBanco}</p>
              ) : (
                <p className="text-xs italic leading-relaxed text-bone-muted">Sin respuesta registrada.</p>
              )}
            </PanelSection>
            <PanelSection title="Hallazgo relacionado">
              <TraceList items={[{ id: respuestaHallazgo.numero, label: respuestaHallazgo.titulo }]} />
            </PanelSection>
          </>
        )}

        {nodo && linkedConnections.length > 0 && (
          <PanelSection title="Relaciones visibles">
            <div className="space-y-2">
              {linkedConnections.map(conn => {
                const otherId = conn.desde === nodo.id ? conn.hacia : conn.desde;
                const other = nodeById.get(otherId);
                return (
                  <div key={conn.id} className="border-l border-wire pl-3">
                    <div
                      className="font-mono text-[9px] uppercase tracking-[0.12em]"
                      style={{ color: relationColor(conn.etiqueta), fontFamily: 'var(--font-mono)' }}
                    >
                      {normalizeRelation(conn.etiqueta)}
                    </div>
                    <div className="mt-0.5 text-xs leading-snug text-bone-muted">
                      {other ? `${other.refId} - ${other.titulo}` : otherId}
                    </div>
                  </div>
                );
              })}
            </div>
          </PanelSection>
        )}
      </div>
    </aside>
  );
}

function PanelSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-t border-wire/80 pt-4">
      <h3
        className="mb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-bone-muted"
        style={{ fontFamily: 'var(--font-mono)' }}
      >
        {title}
      </h3>
      {children}
    </section>
  );
}

function MetricChip({ label, value, className = 'border-wire bg-slate-mid/70 text-bone' }: { label: string; value: string; className?: string }) {
  return (
    <div className={`border px-3 py-2 ${className}`}>
      <div
        className="font-mono text-[8px] uppercase tracking-[0.14em] opacity-75"
        style={{ fontFamily: 'var(--font-mono)' }}
      >
        {label}
      </div>
      <div className="mt-1 truncate text-xs font-semibold uppercase">{value}</div>
    </div>
  );
}

function TraceList({
  title,
  items,
  empty = 'Sin elementos vinculados.',
}: {
  title?: string;
  items: Array<{ id: string; label: string }>;
  empty?: string;
}) {
  return (
    <div className="mb-3 last:mb-0">
      {title && <div className="mb-1.5 text-[11px] font-semibold text-bone">{title}</div>}
      {items.length === 0 ? (
        <p className="text-xs italic text-bone-muted">{empty}</p>
      ) : (
        <div className="space-y-1.5">
          {items.map(item => (
            <div key={`${item.id}-${item.label}`} className="border-l border-wire pl-3">
              <div
                className="font-mono text-[9px] uppercase tracking-[0.1em] text-signal"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                {item.id}
              </div>
              <div className="line-clamp-2 text-xs leading-snug text-bone-muted">{item.label}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function RouteEndpoint({ label, nodo }: { label: string; nodo: NodoTablero | null | undefined }) {
  return (
    <div>
      <div
        className="font-mono text-[9px] uppercase tracking-[0.14em] text-bone-muted"
        style={{ fontFamily: 'var(--font-mono)' }}
      >
        {label}
      </div>
      <div className="mt-1 flex items-start gap-2">
        <span
          className="mt-1 h-2 w-2 shrink-0 rounded-[2px]"
          style={{ background: nodo ? tipoColors[nodo.tipo] : '#6F7C91' }}
        />
        <div className="min-w-0">
          <div
            className="font-mono text-[10px] text-bone"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            {nodo?.refId ?? 'Nodo no disponible'}
          </div>
          <div className="mt-0.5 line-clamp-2 text-xs leading-snug text-bone-muted">
            {nodo?.titulo ?? 'El nodo asociado no esta visible.'}
          </div>
        </div>
      </div>
    </div>
  );
}

function normalizeRelation(label?: string): string {
  const normalized = (label ?? 'relacion')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
  const map: Record<string, string> = {
    sustenta: 'respalda',
    respalda: 'respalda',
    confirma: 'confirma',
    prueba: 'prueba',
    origina: 'origina',
    evalua: 'evalúa',
    'relacionado con': 'relacionado con',
    incumple: 'incumple',
    responde: 'responde',
    contradice: 'contradice',
    mitiga: 'mitiga',
  };
  if (normalized.includes('seguimiento')) return 'seguimiento';
  return map[normalized] ?? normalized;
}

function relationColor(label?: string): string {
  const relation = normalizeRelation(label);
  const map: Record<string, string> = {
    respalda: '#62A9D8',
    confirma: '#A18AD8',
    prueba: '#74C7A6',
    origina: '#74C7A6',
    evalúa: '#D8AD4C',
    'relacionado con': '#D8AD4C',
    incumple: '#F06A49',
    responde: '#70C9AC',
    contradice: '#F06A49',
    mitiga: '#78A85A',
    seguimiento: '#D8A437',
  };
  return map[relation] ?? '#6F7C91';
}

function relationNarrative(label?: string): string {
  const relation = normalizeRelation(label);
  const map: Record<string, string> = {
    respalda: 'La fuente aporta soporte documental o técnico para sostener el hallazgo seleccionado.',
    confirma: 'La fuente refuerza la condición observada mediante una declaración, registro o contraste adicional.',
    prueba: 'La ficha de trabajo produce evidencia directa sobre la condición evaluada.',
    origina: 'La observación o prueba es el punto de partida que deriva en el hallazgo.',
    evalúa: 'El hallazgo se contrasta contra este criterio de control o marco normativo.',
    incumple: 'La condición del hallazgo representa una brecha frente al criterio indicado.',
    responde: 'El auditado entrega una posición, aceptación, descargo o plan de acción asociado al hallazgo.',
    contradice: 'La respuesta o evidencia entra en tensión con la condición documentada.',
    mitiga: 'La acción o respuesta reduce parcialmente el riesgo asociado al hallazgo.',
    seguimiento: 'La relación requiere verificación posterior antes de cerrar la trazabilidad.',
  };
  return map[relation] ?? 'Esta conexión explica una dependencia de trazabilidad entre dos piezas del expediente.';
}
