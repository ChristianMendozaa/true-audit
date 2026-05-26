import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

const routes = [
  '/casos/2026-014',
  '/casos/2026-014/evidencias',
  '/casos/2026-014/hallazgos',
  '/casos/2026-014/hallazgos/H-001',
  '/casos/2026-014/tablero',
  '/casos/2026-014/kanban',
  '/casos/2026-014/timeline',
  '/casos/2026-014/informe',
  '/casos/2026-014/usuarios',
  '/casos/2026-014/movimientos',
  '/marcos',
  '/marcos/cobit',
];

const responsiveRoutes = ['/', '/casos', ...routes];
const responsiveViewports = [
  { width: 360, height: 844 },
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
];

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => window.localStorage.clear());
});

async function gotoReady(page: Page, route: string) {
  await page.goto(route);
  if (route.startsWith('/casos/2026-014')) {
    await expect(page.getByRole('button', { name: 'Restaurar demo original' })).toBeEnabled();
  }
}

test('rutas principales cargan sin consola rota ni overflow horizontal', async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on('console', message => {
    const text = message.text();
    if (message.type() === 'error' && !text.includes('/_next/webpack-hmr')) consoleErrors.push(text);
  });

  for (const route of routes) {
    await gotoReady(page, route);
    await expect(page.locator('body')).toContainText(/True Audit|Auditoria|Hallazgos|Evidencias|Case board|Marcos|Informe/);

    const health = await page.evaluate(() => {
      const unnamedButtons = [...document.querySelectorAll('button')].filter(button => {
        const label = button.textContent?.trim() || button.getAttribute('aria-label') || button.getAttribute('title');
        return !label;
      }).length;

      return {
        overflowX: document.documentElement.scrollWidth > document.documentElement.clientWidth + 2,
        unnamedButtons,
        bodyTextLength: (document.body.textContent ?? '').trim().length,
      };
    });

    expect(health.bodyTextLength).toBeGreaterThan(80);
    expect(health.overflowX).toBe(false);
    expect(health.unnamedButtons).toBe(0);
  }

  expect(consoleErrors).toEqual([]);
});

test('modo sin rol admin no muestra administracion en el indice', async ({ page }) => {
  await gotoReady(page, '/casos/2026-014');
  await expect(page.getByRole('link', { name: /Usuarios y roles/ })).toHaveCount(0);
  await expect(page.getByRole('link', { name: /Movimientos/ })).toHaveCount(0);
});

test('pantallas principales son responsive en mobile y tablet', async ({ page }) => {
  test.slow();
  const consoleErrors: string[] = [];
  page.on('console', message => {
    const text = message.text();
    if (message.type() === 'error' && !text.includes('/_next/webpack-hmr')) {
      consoleErrors.push(`${page.url()}: ${text}`);
    }
  });

  for (const viewport of responsiveViewports) {
    await page.setViewportSize(viewport);

    for (const route of responsiveRoutes) {
      await gotoReady(page, route);

      const health = await page.evaluate(() => ({
        overflowX: document.documentElement.scrollWidth > document.documentElement.clientWidth + 2,
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
        bodyTextLength: (document.body.textContent ?? '').trim().length,
      }));

      expect(health.bodyTextLength, `${route} @ ${viewport.width}px`).toBeGreaterThan(30);
      expect(
        health.overflowX,
        `${route} @ ${viewport.width}px genera overflow horizontal: ${health.scrollWidth}/${health.clientWidth}`,
      ).toBe(false);
    }
  }

  expect(consoleErrors).toEqual([]);
});

test('portada mobile no superpone hero ni tarjetas', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Auditoría de sistemas con trazabilidad total' })).toBeVisible();

  const health = await page.evaluate(() => {
    const h1 = document.querySelector('h1')?.getBoundingClientRect();
    const firstCard = document.querySelector('article')?.getBoundingClientRect();
    const overflowing = [...document.body.querySelectorAll('*')]
      .filter(element => {
        const rect = element.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0 && (rect.left < -2 || rect.right > window.innerWidth + 2);
      })
      .map(element => element.tagName.toLowerCase());

    return {
      overflowX: document.documentElement.scrollWidth > document.documentElement.clientWidth + 2,
      articleCount: document.querySelectorAll('article').length,
      firstCardBelowHero: Boolean(h1 && firstCard && firstCard.top > h1.bottom),
      h1InsideViewport: Boolean(h1 && h1.left >= 0 && h1.right <= window.innerWidth),
      overflowing,
    };
  });

  expect(health.overflowX).toBe(false);
  expect(health.articleCount).toBe(6);
  expect(health.firstCardBelowHero).toBe(true);
  expect(health.h1InsideViewport).toBe(true);
  expect(health.overflowing).toEqual([]);
});

test('flujo MVP permite crear evidencia y hallazgo en modo auditor', async ({ page }) => {
  await gotoReady(page, '/casos/2026-014/evidencias');
  await page.getByRole('button', { name: 'Nueva evidencia' }).click();
  await expect(page.getByRole('heading', { name: 'Ficha documental' })).toBeVisible();
  await page.getByLabel('Tipo').selectOption('checklist');
  await page.getByLabel('Titulo').fill('Checklist de privilegios de usuario');
  await page.getByLabel('Descripcion').fill('Revision manual de cuentas privilegiadas contra la politica vigente.');
  await page.getByLabel('Fuente').fill('Mesa de seguridad TI');
  await page.getByLabel('Nombre de archivo').fill('checklist-privilegios.xlsx');
  await page.getByRole('button', { name: 'Guardar evidencia' }).click();

  await expect(page.getByRole('heading', { name: 'Checklist de privilegios de usuario' })).toBeVisible();

  await gotoReady(page, '/casos/2026-014/hallazgos');
  await page.getByRole('button', { name: 'Nuevo hallazgo' }).click();
  await page.getByLabel('Titulo').fill('Cuentas privilegiadas sin revision formal');
  await page.getByLabel('Condicion').fill('Se identificaron cuentas con privilegios elevados sin evidencia de revision periodica.');
  await page.getByLabel('Criterio').fill('COBIT PO7 y COSO actividades de control requieren roles definidos y supervision.');
  await page.getByLabel('Causa').fill('No existe calendario formal de revision de accesos privilegiados.');
  await page.getByLabel('Efecto').fill('Incremento de riesgo de uso indebido de privilegios.');
  await page.getByLabel('Conclusion').fill('El control requiere formalizacion y evidencia de ejecucion.');
  await page.getByLabel('Recomendacion').fill('Implantar revision trimestral con aprobacion del responsable de TI.');
  await page.getByLabel('Probabilidad').fill('4');
  await page.getByLabel('Impacto').fill('4');
  await page.getByRole('button', { name: 'Guardar hallazgo' }).click();

  await expect(page.getByText('Cuentas privilegiadas sin revision formal')).toBeVisible();
  expect(await page.getByText('Riesgo alto').count()).toBeGreaterThan(0);
});

test('rol auditado registra respuesta y modo demo bloquea edicion', async ({ page }) => {
  await gotoReady(page, '/casos/2026-014/hallazgos/H-001');
  await page.getByLabel('Seleccionar rol de sesion').selectOption('auditado');
  await expect(page.getByLabel('Seleccionar rol de sesion')).toHaveValue('auditado');
  await page.getByRole('button', { name: 'Registrar respuesta del auditado' }).click();
  await page.getByLabel('Argumento del banco').fill('El banco acepta parcialmente el hallazgo y presenta un plan de prueba integral.');
  await expect(page.getByLabel('Comentario del auditor')).toBeDisabled();
  await page.getByRole('button', { name: 'Guardar respuesta' }).click();

  await expect(page.getByText('acepta-parcialmente')).toBeVisible();
  await expect(page.getByText('Auditor: pendiente')).toBeVisible();

  await page.getByLabel('Seleccionar rol de sesion').selectOption('demo');
  await gotoReady(page, '/casos/2026-014/hallazgos');
  await expect(page.getByRole('button', { name: 'Nuevo hallazgo' })).toBeDisabled();
});

test('tablero e informe exponen trazabilidad y exportacion', async ({ page }) => {
  await gotoReady(page, '/casos/2026-014/tablero');
  await expect(page.getByText('Case board forense')).toBeVisible();
  expect(await page.locator('.board-node').count()).toBeGreaterThan(5);

  const boardBackground = await page.locator('.forensic-board').evaluate(element => getComputedStyle(element).backgroundColor);
  expect(boardBackground).not.toBe('rgb(255, 255, 255)');

  await gotoReady(page, '/casos/2026-014/informe');
  await expect(page.getByRole('button', { name: 'Descargar informe PDF' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Descargar fichas PDF' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Exportar matriz Excel' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Imprimir / Guardar PDF' })).toBeVisible();
  await expect(page.getByText('Conclusiones')).toBeVisible();
});

test('tablero permite crear nodos y conectar con relacion guiada', async ({ page }) => {
  await gotoReady(page, '/casos/2026-014/tablero');
  await page.getByRole('button', { name: 'Restaurar demo original' }).click();
  await page.getByRole('button', { name: 'Crear figura' }).click();
  await page.getByTestId('case-board-canvas').click({ position: { x: 520, y: 360 } });
  await page.getByLabel('Titulo de nodo').fill('Nodo de prueba E2E');
  await page.getByLabel('Codigo de nodo').fill('E2E-001');
  await page.getByRole('button', { name: 'Crear nodo' }).click();
  await expect(page.getByTestId('case-board-canvas').getByText('Nodo de prueba E2E')).toBeVisible();

  await page.getByLabel('Seleccionar tipo de relacion').selectOption('mitiga');
  await page.getByRole('button', { name: 'Conectar' }).click();
  await page.locator('.board-node').filter({ hasText: 'Nodo de prueba E2E' }).click();
  await page.locator('.board-node').filter({ hasText: 'H-001' }).click({ force: true });
  await expect(page.getByTestId('case-board-canvas').getByText('MITIGA')).toBeVisible();
});

test('kanban cambia estado al mover tarjeta de hallazgo', async ({ page }) => {
  await gotoReady(page, '/casos/2026-014/kanban');
  const card = page.getByTestId('kanban-card-H-003');
  const target = page.getByTestId('kanban-column-respondido');
  await target.evaluate(element => element.scrollIntoView({ block: 'nearest', inline: 'center' }));
  const cardBox = await card.boundingBox();
  const targetBox = await target.boundingBox();
  expect(cardBox).not.toBeNull();
  expect(targetBox).not.toBeNull();

  await page.mouse.move(cardBox!.x + cardBox!.width / 2, cardBox!.y + cardBox!.height / 2);
  await page.mouse.down();
  await page.mouse.move(targetBox!.x + targetBox!.width / 2, targetBox!.y + 80, { steps: 14 });
  await page.mouse.up();
  await expect(target).toContainText('H-003');
});

test('informe descarga PDFs y matriz Excel', async ({ page }) => {
  await gotoReady(page, '/casos/2026-014/informe');

  const informeDownload = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Descargar informe PDF' }).click();
  expect((await informeDownload).suggestedFilename()).toMatch(/informe-final-2026-014\.pdf$/);

  const fichasDownload = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Descargar fichas PDF' }).click();
  expect((await fichasDownload).suggestedFilename()).toMatch(/fichas-hallazgo-2026-014\.pdf$/);

  const matrizDownload = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Exportar matriz Excel' }).click();
  expect((await matrizDownload).suggestedFilename()).toMatch(/matriz-cobit-2026-014\.xlsx$/);
});
