import { getHallazgoById } from '@/lib/mock-data';
import FindingDefenseClient from '@/components/cases/FindingDefenseClient';

interface FindingDefenseProps {
  params: Promise<{ caseId: string; findingId: string }>;
}

export async function generateMetadata({ params }: FindingDefenseProps) {
  const { caseId, findingId } = await params;
  const hallazgo = getHallazgoById(caseId, findingId);
  return { title: hallazgo ? `Defensa ${hallazgo.numero} / True Audit` : 'Defensa / True Audit' };
}

export default async function FindingDefense({ params }: FindingDefenseProps) {
  const { caseId, findingId } = await params;
  return <FindingDefenseClient caseId={caseId} findingId={findingId} />;
}
