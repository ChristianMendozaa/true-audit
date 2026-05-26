import { getHallazgoById } from '@/lib/mock-data';
import FindingDetailClient from '@/components/cases/FindingDetailClient';

interface FindingDetailProps {
  params: Promise<{ caseId: string; findingId: string }>;
}

export async function generateMetadata({ params }: FindingDetailProps) {
  const { caseId, findingId } = await params;
  const h = getHallazgoById(caseId, findingId);
  return { title: h ? `${h.numero} / True Audit` : 'Hallazgo / True Audit' };
}

export default async function FindingDetail({ params }: FindingDetailProps) {
  const { caseId, findingId } = await params;
  return <FindingDetailClient caseId={caseId} findingId={findingId} />;
}
