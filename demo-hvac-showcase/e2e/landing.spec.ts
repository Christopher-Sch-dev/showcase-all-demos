// E2E de PRODUCCIÓN REAL — LANDING de venta (EN + ES).
// Contrato: hero de venta, badge MODE DEMO, CTA Calendly (NUNCA mailto),
// pain point con métricas + source, y sin overflow horizontal en mobile 375.
// NUNCA mock: se prueba el build estático servido (ver reporte).
import { test, expect, type Page } from '@playwright/test';

const BASE = process.env.E2E_BASE_URL ?? 'http://localhost:8080';

// rol: knob de demo para determinismo E2E (sin feed/emergencias automáticas).
// Es DI de la app, NO mock: cambia el timing del loop, no la lógica.
async function setLoopFast(page: Page) {
  await page.addInitScript(() => localStorage.setItem('demo-hvac:loop-speed', 'fast'));
}

// rol: assert de que NO hay overflow horizontal (body ancho <= viewport).
async function expectNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(() => {
    const vw = document.documentElement.clientWidth;
    let worst = 0;
    document.querySelectorAll('*').forEach((el) => {
      const r = (el as HTMLElement).getBoundingClientRect();
      const w = r.right;
      if (w > worst) worst = w;
    });
    return { vw, worst };
  });
  // tolerancia de 1px por subpixel rendering; si algo sobresale >1px → overflow real
  expect(overflow.worst, `overflow horizontal: max right=${overflow.worst}px > viewport=${overflow.vw}px`).toBeLessThanOrEqual(overflow.vw + 1);
}

test.describe('Landing / — EN', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('hero de venta visible con headline y CTA Calendly', async ({ page }) => {
    await setLoopFast(page);
    await page.goto(BASE + '/');
    await expect(page).toHaveTitle(/demo/i);

    // headline de venta (anti-tech-demo: problema con $ concreto)
    await expect(
      page.getByRole('heading', { name: 'Stop losing $2,200 jobs to missed calls' }),
    ).toBeVisible();

    // badge MODE DEMO
    await expect(page.getByText('Mode demo', { exact: true })).toBeVisible();

    // CTA principal → Calendly, NUNCA mailto. El label real del CTA es config.cta.label.
    const heroCta = page.getByRole('link', { name: 'Book a demo call' }).first();
    await expect(heroCta).toBeVisible();
    const href = await heroCta.getAttribute('href');
    expect(href).toContain('calendly.com/csch1305');
    expect(href).not.toContain('mailto:');

    // pain point con métricas y source
    await expect(page.getByRole('heading', { name: '62% of HVAC calls go unanswered' })).toBeVisible();
    for (const metric of ['62%', '85%', '$2,200']) {
      await expect(page.getByText(metric, { exact: true }).first()).toBeVisible();
    }
  });

  test('CTA final también es Calendly (nunca mailto)', async ({ page }) => {
    await page.goto(BASE + '/');
    const links = page.getByRole('link', { name: 'Book a demo call' });
    const count = await links.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      const href = await links.nth(i).getAttribute('href');
      expect(href).toContain('calendly.com/csch1305');
      expect(href).not.toContain('mailto:');
    }
  });
});

test.describe('Landing /es/ — ES', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('hero en español + CTA Calendly', async ({ page }) => {
    await setLoopFast(page);
    await page.goto(BASE + '/es/');
    await expect(
      page.getByRole('heading', { name: 'Deja de perder trabajos de $2,200 por llamadas perdidas' }),
    ).toBeVisible();
    await expect(page.getByText('Modo demo', { exact: true })).toBeVisible();
    // selector robusto: el CTA real es el link cuyo href apunta a Calendly (evita el link del logo `/es/`)
    const cta = page.locator('a[href*="calendly.com/csch1305"]').first();
    await expect(cta).toBeVisible();
    const href = await cta.getAttribute('href');
    expect(href).toContain('calendly.com/csch1305');
    expect(href).not.toContain('mailto:');
  });
});

test.describe('Landing mobile 375 — sin overflow', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('no hay overflow horizontal y los CTAs siguen visibles', async ({ page }) => {
    await setLoopFast(page);
    await page.goto(BASE + '/');
    await expectNoHorizontalOverflow(page);
    await expect(
      page.getByRole('heading', { name: 'Stop losing $2,200 jobs to missed calls' }),
    ).toBeVisible();

    // el CTA de venta es tocable (dentro del viewport, tamaño real ≥44px de alto)
    const heroCta = page.getByRole('link', { name: 'Book a demo call' }).first();
    await expect(heroCta).toBeVisible();
    const box = (await heroCta.boundingBox())!;
    expect(box.height).toBeGreaterThanOrEqual(44);
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(375 + 1);
  });

  test('no hay overflow horizontal en /es/ mobile', async ({ page }) => {
    await setLoopFast(page);
    await page.goto(BASE + '/es/');
    await expectNoHorizontalOverflow(page);
  });
});
