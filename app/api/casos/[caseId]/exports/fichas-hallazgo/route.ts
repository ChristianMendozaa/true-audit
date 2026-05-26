import type { Caso } from '@/lib/types';
import { renderFichasHallazgoPdf } from '@/lib/exports/pdf-documents';

export const runtime = 'nodejs';

export async function POST(request: Request, { params }: { params: Promise<{ caseId: string }> }) {
  const { caseId } = await params;
  const body = await request.json() as { caso?: Caso };

  if (!body.caso || body.caso.id !== caseId) {
    return Response.json({ error: 'Caso invalido para exportacion.' }, { status: 400 });
  }

  const buffer = await renderFichasHallazgoPdf(body.caso);
  return new Response(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="fichas-hallazgo-${body.caso.numero}.pdf"`,
    },
  });
}
