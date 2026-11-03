import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ModeBadge from '@/components/ModeBadge';
import { t } from '../../tests/helpers/fixture';

describe('ModeBadge', () => {
  it('muestra el badge i18n siempre visible (EN)', () => {
    render(<ModeBadge t={t()} onReset={() => {}} />);
    // Se lee del diccionario, no de un literal: la landing inglesa no lleva texto en español.
    expect(screen.getByTestId('mode-badge')).toHaveTextContent(t().modeBadge);
    expect(t().modeBadge).toBe('DEMO MODE');
  });

  it('muestra el label i18n del badge en español', () => {
    render(<ModeBadge t={t('es')} onReset={() => {}} />);
    expect(screen.getByTestId('mode-badge')).toHaveTextContent(t('es').modeBadge);
    expect(t('es').modeBadge).toBe('MODO DEMO');
  });

  it('botón reset llama onReset (resetDemo del core)', () => {
    const onReset = vi.fn();
    render(<ModeBadge t={t()} onReset={onReset} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onReset).toHaveBeenCalledTimes(1);
  });

  it('cumple touch >= 44px en el botón reset', () => {
    render(<ModeBadge t={t()} onReset={() => {}} />);
    expect(screen.getByRole('button').className).toContain('min-h-[44px]');
  });
});
