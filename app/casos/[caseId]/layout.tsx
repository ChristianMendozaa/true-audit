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
      <div className="audit-shell flex h-dvh flex-col overflow-hidden bg-paper">
        <SiteHeader compact />
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden md:flex-row">
          <CaseSidebar
            caseId={caso.id}
            caseName={caso.banco}
            caseNumber={caso.numero}
          />
          <div className="min-w-0 flex-1 overflow-auto">
            {children}
          </div>
        </div>
      </div>
    </CaseDataProvider>
  );
}
