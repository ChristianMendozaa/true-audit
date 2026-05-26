import { getCasoById } from '@/lib/mock-data';
import TimelineClient from '@/components/cases/TimelineClient';

interface TimelinePageProps {
  params: Promise<{ caseId: string }>;
}

export async function generateMetadata({ params }: TimelinePageProps) {
  const { caseId } = await params;
  const caso = getCasoById(caseId);
  return { title: caso ? `Linea de tiempo / ${caso.numero} / True Audit` : 'Timeline / True Audit' };
}

export default function TimelinePage() {
  return <TimelineClient />;
}
