'use client';

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
    <div className="dark h-[calc(100dvh-49px)] min-h-[620px] overflow-hidden" style={{ background: '#0E1116' }}>
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
