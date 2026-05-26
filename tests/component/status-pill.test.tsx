import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import StatusPill from '@/components/data/StatusPill';

describe('StatusPill', () => {
  it('muestra sellos de riesgo entendibles para auditoria', () => {
    render(<StatusPill status="critico" />);
    expect(screen.getByText('Riesgo alto')).toBeInTheDocument();
  });

  it('muestra estados de respuesta del auditado', () => {
    render(<StatusPill status="parcial" size="sm" />);
    expect(screen.getByText('Respuesta parcial')).toBeInTheDocument();
  });
});
