import { notFound } from 'next/navigation';
import CaseAdminClient from '@/components/cases/CaseAdminClient';
import { getCasoById } from '@/lib/mock-data';

interface CaseUsersPageProps {
  params: Promise<{ caseId: string }>;
}

export async function generateMetadata({ params }: CaseUsersPageProps) {
  const { caseId } = await params;
  const caso = getCasoById(caseId);
  return { title: caso ? `Usuarios ${caso.numero} / True Audit` : 'Usuarios / True Audit' };
}

export default async function CaseUsersPage({ params }: CaseUsersPageProps) {
  const { caseId } = await params;
  const caso = getCasoById(caseId);
  if (!caso) notFound();

  return (
    <CaseAdminClient
      caseId={caso.id}
      caseNumber={caso.numero}
      bankName={caso.banco}
      view="usuarios"
    />
  );
}
