import { notFound } from 'next/navigation';
import SiteHeader from '@/components/shell/SiteHeader';
import CaseSidebar from '@/components/shell/CaseSidebar';
import CaseDataProvider from '@/components/data/CaseDataProvider';
import { getCasoById } from '@/lib/mock-data';

interface CaseLayoutProps {
  children: React.ReactNode;
  params: Promise<{ caseId: string }>;
}

export default async function CaseLayout({ children, params }: CaseLayoutProps) {
  const { caseId } = await params;
  const caso = getCasoById(caseId);

  if (!caso) notFound();

  return (
    <CaseDataProvider initialCaso={caso}>
      <div className="audit-shell min-h-dvh flex flex-col bg-paper">
        <SiteHeader compact />
        <div className="flex flex-1 min-h-0">
          <CaseSidebar
            caseId={caso.id}
            caseName={caso.banco}
            caseNumber={caso.numero}
          />
          <div className="flex-1 min-w-0 overflow-auto">
            {children}
          </div>
        </div>
      </div>
    </CaseDataProvider>
  );
}
