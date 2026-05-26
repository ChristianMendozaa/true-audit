import type { Caso } from '@/lib/types';
import { renderMatrizCobitXlsx } from '@/lib/exports/matriz-cobit';

export const runtime = 'nodejs';

export async function POST(request: Request, { params }: { params: Promise<{ caseId: string }> }) {
  const { caseId } = await params;
  const body = await request.json() as { caso?: Caso };

  if (!body.caso || body.caso.id !== caseId) {
    return Response.json({ error: 'Caso invalido para exportacion.' }, { status: 400 });
  }

  const buffer = await renderMatrizCobitXlsx(body.caso);
  return new Response(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="matriz-cobit-${body.caso.numero}.xlsx"`,
    },
  });
}
