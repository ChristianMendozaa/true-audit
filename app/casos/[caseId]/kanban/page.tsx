import { getCasoById } from '@/lib/mock-data';
import KanbanClient from '@/components/cases/KanbanClient';

interface KanbanPageProps {
  params: Promise<{ caseId: string }>;
}

export async function generateMetadata({ params }: KanbanPageProps) {
  const { caseId } = await params;
  const caso = getCasoById(caseId);
  return { title: caso ? `Kanban / ${caso.numero} / True Audit` : 'Kanban / True Audit' };
}

export default function KanbanPage() {
  return <KanbanClient />;
}
