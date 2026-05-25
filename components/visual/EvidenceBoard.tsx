'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import type { NodoTablero, ConexionTablero, TipoNodo, Caso } from '@/lib/types';
import NodeShape from './NodeShape';
import ConnectionLine from './ConnectionLine';

interface EvidenceBoardProps {
  nodos: NodoTablero[];
  conexiones: ConexionTablero[];
  caso: Caso;
}

const NODE_W = 150;
const NODE_H = 72;

type FilterTipo = TipoNodo | null;
type FilterMarco = 'COBIT' | 'COSO' | 'RGSI' | null;

const tipoLabels: Record<TipoNodo, string> = {
  documento: 'Doc',
  evidencia: 'Evid.',
  entrevista: 'Entrev.',
  prueba: 'Prueba',
  hallazgo: 'Hallazgo',
  criterio: 'Criterio',
  respuesta: 'Respuesta',
};

export default function EvidenceBoard({ nodos: initialNodos, conexiones, caso }: EvidenceBoardProps) {
  const [nodos, setNodos] = useState<NodoTablero[]>(initialNodos);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filterTipo, setFilterTipo] = useState<FilterTipo>(null);
  const [filterMarco, setFilterMarco] = useState<FilterMarco>(null);
  const [pan, setPan] = useState({ x: 60, y: 40 });
  const [zoom, setZoom] = useState(0.72);
  const draggingRef = useRef<{ id: string; startX: number; startY: number; origX: number; origY: number } | null>(null);
  const panningRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

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

  const isNodeVisible = useCallback((nodo: NodoTablero) => {
    if (filterTipo && nodo.tipo !== filterTipo) return false;
    if (filterMarco && nodo.tipo === 'criterio') {
      const upper = nodo.titulo.toUpperCase();
      if (!upper.includes(filterMarco)) return false;
    }
    return true;
  }, [filterTipo, filterMarco]);

  const handlePointerDownNode = (e: React.PointerEvent<SVGGElement>, id: string) => {
    e.stopPropagation();
    const nodo = nodos.find(n => n.id === id);
    if (!nodo) return;
    setSelectedId(id);
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
    draggingRef.current = null;
    panningRef.current = null;
  };

  const handlePointerDownSVG = (e: React.PointerEvent<SVGSVGElement>) => {
    const target = e.target as SVGElement;
    if (target === svgRef.current || target.classList.contains('board-bg-rect')) {
      setSelectedId(null);
      panningRef.current = { startX: e.clientX, startY: e.clientY, origX: pan.x, origY: pan.y };
    }
  };

  const selectedNodo = nodos.find(n => n.id === selectedId);
  const selectedHallazgo = selectedNodo?.tipo === 'hallazgo'
    ? caso.hallazgos.find(h => h.id === selectedNodo.refId)
    : null;
  const selectedEvidencia = selectedNodo && ['documento', 'evidencia', 'entrevista', 'prueba', 'contrato', 'acta'].includes(selectedNodo.tipo)
    ? caso.evidencias.find(e => e.id === selectedNodo.refId)
    : null;

  const MINIMAP_W = 160;
  const MINIMAP_H = 100;
  const allX = nodos.map(n => n.x);
  const allY = nodos.map(n => n.y);
  const minX = Math.min(...allX) - 20;
  const minY = Math.min(...allY) - 20;
  const maxX = Math.max(...allX) + NODE_W + 20;
  const maxY = Math.max(...allY) + NODE_H + 20;
  const mmScaleX = MINIMAP_W / (maxX - minX);
  const mmScaleY = MINIMAP_H / (maxY - minY);
  const mmScale = Math.min(mmScaleX, mmScaleY);

  const filterTipos: TipoNodo[] = ['documento', 'evidencia', 'entrevista', 'prueba', 'hallazgo', 'criterio', 'respuesta'];
  const filterMarcos: Array<'COBIT' | 'COSO' | 'RGSI'> = ['COBIT', 'COSO', 'RGSI'];

  return (
    <div className="relative w-full h-full overflow-hidden dark-grid select-none" style={{ background: '#0E1116' }}>
      {/* Toolbar */}
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
        <div className="flex gap-1 flex-wrap">
          <FilterBtn
            active={filterTipo === null}
            onClick={() => setFilterTipo(null)}
            label="Todo"
          />
          {filterTipos.map(t => (
            <FilterBtn key={t} active={filterTipo === t} onClick={() => setFilterTipo(filterTipo === t ? null : t)} label={tipoLabels[t]} />
          ))}
        </div>
        <div className="flex gap-1">
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
            />
          ))}
        </div>
      </div>

      {/* Zoom controls */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-1">
        <button
          onClick={() => setZoom(z => Math.min(z + 0.1, 2.5))}
          className="w-7 h-7 flex items-center justify-center bg-slate-dark border border-wire text-bone hover:border-signal hover:text-signal transition-colors text-sm font-mono"
        >+</button>
        <button
          onClick={() => setZoom(z => Math.max(z - 0.1, 0.25))}
          className="w-7 h-7 flex items-center justify-center bg-slate-dark border border-wire text-bone hover:border-signal hover:text-signal transition-colors text-sm font-mono"
        >−</button>
        <button
          onClick={() => { setPan({ x: 60, y: 40 }); setZoom(0.72); }}
          className="w-7 h-7 flex items-center justify-center bg-slate-dark border border-wire text-bone-muted hover:border-signal hover:text-signal transition-colors mt-1"
          title="Restablecer vista"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <circle cx="6" cy="6" r="4" stroke="currentColor" strokeWidth="1.5"/>
            <circle cx="6" cy="6" r="1.5" fill="currentColor"/>
          </svg>
        </button>
        <div
          className="text-center font-mono text-bone-muted mt-1"
          style={{ fontFamily: 'var(--font-mono)', fontSize: '9px' }}
        >
          {Math.round(zoom * 100)}%
        </div>
      </div>

      {/* SVG Board */}
      <svg
        ref={svgRef}
        className="w-full h-full"
        style={{ cursor: panningRef.current ? 'grabbing' : 'grab' }}
        onPointerDown={handlePointerDownSVG}
        onPointerMove={handlePointerMoveSVG}
        onPointerUp={handlePointerUpSVG}
        onPointerLeave={handlePointerUpSVG}
      >
        <defs>
          <pattern id="finegrid" width="40" height="40" patternUnits="userSpaceOnUse"
            patternTransform={`translate(${pan.x % 40},${pan.y % 40})`}
          >
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1E2430" strokeWidth="0.5"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#finegrid)" className="board-bg-rect" />

        <g transform={`translate(${pan.x},${pan.y}) scale(${zoom})`}>
          {/* Connections */}
          {conexiones.map(conn => {
            const from = nodos.find(n => n.id === conn.desde);
            const to = nodos.find(n => n.id === conn.hacia);
            if (!from || !to) return null;
            const fromVisible = isNodeVisible(from);
            const toVisible = isNodeVisible(to);
            const isDimmed = (filterTipo || filterMarco) ? !fromVisible || !toVisible : false;
            const isSelected = selectedId === conn.desde || selectedId === conn.hacia;

            return (
              <ConnectionLine
                key={conn.id}
                x1={from.x + NODE_W / 2}
                y1={from.y + NODE_H / 2}
                x2={to.x + NODE_W / 2}
                y2={to.y + NODE_H / 2}
                label={conn.etiqueta}
                dimmed={isDimmed}
                selected={isSelected && !isDimmed}
              />
            );
          })}

          {/* Nodes */}
          {nodos.map((nodo, i) => {
            const visible = isNodeVisible(nodo);
            const dimmed = (filterTipo || filterMarco) ? !visible : false;

            return (
              <g
                key={nodo.id}
                transform={`translate(${nodo.x},${nodo.y})`}
                onPointerDown={e => handlePointerDownNode(e, nodo.id)}
                className="board-node"
                style={{
                  opacity: dimmed ? 0.1 : 1,
                  cursor: 'grab',
                  animationDelay: `${i * 30}ms`,
                }}
              >
                <NodeShape
                  tipo={nodo.tipo}
                  titulo={nodo.titulo}
                  subtitulo={nodo.subtitulo}
                  selected={selectedId === nodo.id}
                  width={NODE_W}
                  height={NODE_H}
                  severidad={nodo.severidad}
                />
              </g>
            );
          })}
        </g>
      </svg>

      {/* Detail panel */}
      {selectedNodo && (
        <div className="absolute top-0 right-0 w-72 h-full bg-slate-dark border-l border-wire overflow-y-auto animate-slide-in-right z-30">
          <div className="p-4 border-b border-wire flex items-start justify-between">
            <div>
              <div
                className="text-[10px] text-bone-muted uppercase tracking-widest"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                {tipoLabels[selectedNodo.tipo]}
              </div>
              <div
                className="font-display text-bone text-base font-semibold mt-1 leading-tight"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {selectedNodo.titulo}
              </div>
            </div>
            <button
              onClick={() => setSelectedId(null)}
              className="text-bone-muted hover:text-bone mt-0.5 shrink-0"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <line x1="4" y1="4" x2="12" y2="12" stroke="currentColor" strokeWidth="1.5"/>
                <line x1="12" y1="4" x2="4" y2="12" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
            </button>
          </div>

          <div className="p-4 space-y-4">
            {selectedHallazgo && (
              <>
                <PanelSection title="Condición">
                  <p className="text-xs text-bone leading-relaxed">{selectedHallazgo.condicion.slice(0, 200)}...</p>
                </PanelSection>
                <PanelSection title="Severidad">
                  <SeverityBadge sev={selectedHallazgo.severidad} />
                </PanelSection>
                <PanelSection title="Evidencias vinculadas">
                  <div className="flex flex-wrap gap-1">
                    {selectedHallazgo.evidencias.map(eid => (
                      <span key={eid} className="font-mono text-[10px] px-1.5 py-0.5 bg-wire text-bone-muted rounded" style={{ fontFamily: 'var(--font-mono)' }}>{eid}</span>
                    ))}
                  </div>
                </PanelSection>
                <PanelSection title="Criterios">
                  <div className="flex flex-wrap gap-1">
                    {selectedHallazgo.criterios.map(cid => (
                      <span key={cid} className="font-mono text-[10px] px-1.5 py-0.5 bg-wire text-signal rounded" style={{ fontFamily: 'var(--font-mono)' }}>{cid.replace('COBIT-', '').replace('COSO-', 'COSO ').replace('RGSI-', 'RGSI ')}</span>
                    ))}
                  </div>
                </PanelSection>
                <a
                  href={`/casos/${caso.id}/hallazgos/${selectedHallazgo.id}`}
                  className="inline-flex items-center gap-1 text-xs text-signal hover:text-bone-muted transition-colors"
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  Ver hallazgo completo →
                </a>
              </>
            )}

            {selectedEvidencia && (
              <>
                <PanelSection title="Descripción">
                  <p className="text-xs text-bone leading-relaxed">{selectedEvidencia.descripcion}</p>
                </PanelSection>
                <PanelSection title="Fecha / Fuente">
                  <p className="font-mono text-[10px] text-bone-muted" style={{ fontFamily: 'var(--font-mono)' }}>{selectedEvidencia.fecha}</p>
                  <p className="text-xs text-bone-muted mt-0.5">{selectedEvidencia.fuente}</p>
                </PanelSection>
                {selectedEvidencia.formato && (
                  <PanelSection title="Formato">
                    <span className="font-mono text-[10px] px-2 py-0.5 bg-wire text-bone-muted rounded" style={{ fontFamily: 'var(--font-mono)' }}>
                      {selectedEvidencia.formato}
                      {selectedEvidencia.paginas ? ` · ${selectedEvidencia.paginas} págs.` : ''}
                    </span>
                  </PanelSection>
                )}
              </>
            )}

            {selectedNodo.tipo === 'criterio' && (
              <PanelSection title="Referencia">
                <p className="font-mono text-[10px] text-signal" style={{ fontFamily: 'var(--font-mono)' }}>{selectedNodo.refId}</p>
                <p className="text-xs text-bone-muted mt-1">Ver el marco normativo completo en la sección Marcos.</p>
              </PanelSection>
            )}

            {selectedNodo.tipo === 'respuesta' && (
              <PanelSection title="Respuesta del banco">
                {(() => {
                  const h = caso.hallazgos.find(h => h.id === selectedNodo.refId);
                  return h?.respuestaBanco
                    ? <p className="text-xs text-bone leading-relaxed">{h.respuestaBanco}</p>
                    : <p className="text-xs text-bone-muted italic">Sin respuesta registrada</p>;
                })()}
              </PanelSection>
            )}
          </div>
        </div>
      )}

      {/* Minimap */}
      <div className="absolute bottom-4 left-4 z-20 border border-wire bg-slate-dark/90 rounded overflow-hidden" style={{ width: MINIMAP_W, height: MINIMAP_H }}>
        <div className="absolute inset-0 flex items-center justify-center">
          <svg width={MINIMAP_W} height={MINIMAP_H} viewBox={`0 0 ${MINIMAP_W} ${MINIMAP_H}`}>
            {nodos.map(nodo => {
              const mx = (nodo.x - minX) * mmScale;
              const my = (nodo.y - minY) * mmScale;
              const mw = NODE_W * mmScale;
              const mh = NODE_H * mmScale;
              const fill = nodo.tipo === 'hallazgo'
                ? (nodo.severidad === 'critico' ? '#E0593F' : nodo.severidad === 'medio' ? '#C8951A' : '#5B8C3A')
                : nodo.tipo === 'criterio' ? '#8A6E45'
                : nodo.tipo === 'entrevista' ? '#6A5492'
                : nodo.tipo === 'prueba' ? '#4A7B6A'
                : '#4A7BA7';
              return (
                <rect
                  key={nodo.id}
                  x={mx} y={my}
                  width={Math.max(mw, 3)} height={Math.max(mh, 2)}
                  fill={fill}
                  opacity={isNodeVisible(nodo) ? 0.9 : 0.2}
                  rx={1}
                />
              );
            })}
          </svg>
        </div>
        <div
          className="absolute bottom-1 right-1.5 font-mono text-bone-muted"
          style={{ fontFamily: 'var(--font-mono)', fontSize: '7px' }}
        >
          MINIMAP
        </div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 right-4 z-20 flex flex-col gap-1 bg-slate-dark/90 border border-wire p-2 rounded">
        {(['hallazgo', 'criterio', 'entrevista', 'prueba', 'documento'] as TipoNodo[]).map(t => (
          <div key={t} className="flex items-center gap-1.5">
            <div
              className="w-2 h-2 rounded-sm shrink-0"
              style={{
                background: t === 'hallazgo' ? '#E0593F'
                  : t === 'criterio' ? '#8A6E45'
                  : t === 'entrevista' ? '#6A5492'
                  : t === 'prueba' ? '#4A7B6A'
                  : '#4A7BA7',
              }}
            />
            <span
              className="text-bone-muted"
              style={{ fontFamily: 'var(--font-mono)', fontSize: '9px' }}
            >
              {tipoLabels[t]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function FilterBtn({ active, onClick, label, mono }: { active: boolean; onClick: () => void; label: string; mono?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`
        px-2.5 py-1 text-[10px] border transition-all rounded-sm
        ${active
          ? 'bg-signal text-void border-signal font-semibold'
          : 'bg-slate-dark text-bone-muted border-wire hover:text-bone hover:border-wire-light'
        }
      `}
      style={{ fontFamily: mono ? 'var(--font-mono)' : 'var(--font-sans)', letterSpacing: mono ? '0.06em' : undefined }}
    >
      {label}
    </button>
  );
}

function PanelSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div
        className="text-[10px] text-bone-muted uppercase tracking-widest mb-1.5"
        style={{ fontFamily: 'var(--font-mono)' }}
      >
        {title}
      </div>
      {children}
    </div>
  );
}

function SeverityBadge({ sev }: { sev: string }) {
  const map: Record<string, string> = {
    critico: 'bg-ember/20 text-ember border-ember/30',
    medio:   'bg-signal/20 text-signal border-signal/30',
    bajo:    'bg-olive/20 text-olive border-olive/30',
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded border text-[10px] font-mono uppercase tracking-wider ${map[sev] || ''}`}
      style={{ fontFamily: 'var(--font-mono)' }}
    >
      {sev}
    </span>
  );
}
