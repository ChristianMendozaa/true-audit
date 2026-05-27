'use client';

import Link from 'next/link';
import { useCaseData } from '@/components/data/CaseDataProvider';
import EvidenceBoard from '@/components/visual/EvidenceBoard';
import { useAuth } from '@/components/auth/AuthProvider';

export default function TableroClient() {
  const {
    caso,
    updateBoardNodes,
    addBoardNode,
    deleteBoardNode,
    addBoardConnection,
    deleteBoardConnection,
  } = useCaseData();
  const { canEditAuditWork } = useAuth();

  return (
    <div className="dark relative h-[calc(100dvh-49px)] min-h-[620px] overflow-hidden" style={{ background: '#0E1116' }}>
      <div className="absolute top-4 right-20 z-20">
        <Link
          href={`/casos/${caso.id}/kanban`}
          className="flex h-8 items-center justify-center border border-rule bg-slate-dark/95 px-3 text-xs font-medium text-bone-muted transition-colors hover:border-signal hover:text-signal"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          Vista Kanban
        </Link>
      </div>
      <EvidenceBoard
        nodos={caso.nodosTablero}
        conexiones={caso.conexionesTablero}
        caso={caso}
        canEdit={canEditAuditWork}
        onNodosChange={canEditAuditWork ? updateBoardNodes : undefined}
        onAddNode={canEditAuditWork ? addBoardNode : undefined}
        onDeleteNode={canEditAuditWork ? deleteBoardNode : undefined}
        onAddConnection={canEditAuditWork ? addBoardConnection : undefined}
        onDeleteConnection={canEditAuditWork ? deleteBoardConnection : undefined}
      />
    </div>
  );
}
