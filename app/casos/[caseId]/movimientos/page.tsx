import { notFound } from 'next/navigation';
import CaseAdminClient from '@/components/cases/CaseAdminClient';
import { getCasoById } from '@/lib/mock-data';

interface CaseMovementsPageProps {
  params: Promise<{ caseId: string }>;
}

export async function generateMetadata({ params }: CaseMovementsPageProps) {
  const { caseId } = await params;
  const caso = getCasoById(caseId);
  return { title: caso ? `Movimientos ${caso.numero} / True Audit` : 'Movimientos / True Audit' };
}

export default async function CaseMovementsPage({ params }: CaseMovementsPageProps) {
  const { caseId } = await params;
  const caso = getCasoById(caseId);
  if (!caso) notFound();

  return (
    <CaseAdminClient
      caseId={caso.id}
      caseNumber={caso.numero}
      bankName={caso.banco}
      view="movimientos"
    />
  );
}
