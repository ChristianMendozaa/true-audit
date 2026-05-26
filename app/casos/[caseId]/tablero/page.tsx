import { getCasoById } from '@/lib/mock-data';
import TableroClient from '@/components/cases/TableroClient';

interface TableroPageProps {
  params: Promise<{ caseId: string }>;
}

export async function generateMetadata({ params }: TableroPageProps) {
  const { caseId } = await params;
  const caso = getCasoById(caseId);
  return { title: caso ? `Tablero / ${caso.numero} / True Audit` : 'Tablero / True Audit' };
}

export default function TableroPage() {
  return <TableroClient />;
}
