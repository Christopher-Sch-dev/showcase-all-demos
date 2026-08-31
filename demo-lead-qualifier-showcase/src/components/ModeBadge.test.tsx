import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ModeBadge from '@/components/ModeBadge';
import { t } from '../../tests/helpers/fixture';

describe('ModeBadge', () => {
  it('muestra MODO DEMO siempre visible', () => {
    render(<ModeBadge t={t()} onReset={() => {}} />);
    expect(screen.getByTestId('mode-badge')).toHaveTextContent('MODO DEMO');
  });

  it('muestra el label i18n del badge en español', () => {
    render(<ModeBadge t={t('es')} onReset={() => {}} />);
    expect(screen.getByTestId('mode-badge')).toHaveTextContent('MODO DEMO');
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
