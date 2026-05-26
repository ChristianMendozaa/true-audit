import { getCasoById } from '@/lib/mock-data';
import InformeClient from '@/components/cases/InformeClient';

interface InformePageProps {
  params: Promise<{ caseId: string }>;
}

export async function generateMetadata({ params }: InformePageProps) {
  const { caseId } = await params;
  const caso = getCasoById(caseId);
  return { title: caso ? `Informe / ${caso.numero} / True Audit` : 'Informe / True Audit' };
}

export default function InformePage() {
  return <InformeClient />;
}
