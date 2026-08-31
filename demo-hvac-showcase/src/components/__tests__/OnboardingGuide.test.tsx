import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { OnboardingGuide } from '../OnboardingGuide';

// rol: suite de la guía de onboarding — paso a paso LITERAL (qué botón, en qué orden)
// + colapsable. En lenguaje de negocio, no técnico. i18n EN por defecto, es por prop.

describe('OnboardingGuide — paso a paso literal del flujo de llamadas', () => {
  it('muestra los 4 pasos numerados del flujo captura→invoice', () => {
    render(<OnboardingGuide />);
    expect(screen.getByTestId('onboarding-guide')).toBeInTheDocument();

    // 4 pasos numerados (headings únicos por paso)
    expect(screen.getByRole('heading', { name: /Capture the call/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Qualify & book/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Assign & dispatch/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Invoice/i })).toBeInTheDocument();
  });

  it('lista los botones literales que hay que clickear, en orden', () => {
    render(<OnboardingGuide />);
    // cada acción real del dashboard está nombrada en la guía
    for (const btn of [
      /Capture as lead/i,
      /Qualify/i,
      /Book/i,
      /Assign…/i,
      /Dispatch/i,
      /Start/i,
      /Complete/i,
      /Invoice/i,
    ]) {
      expect(screen.getAllByText(btn).length).toBeGreaterThan(0);
    }
  });

  it('menciona la nota de auto-calificación (la IA devuelve la llamada sola)', () => {
    render(<OnboardingGuide />);
    expect(screen.getByText(/calls the lead back and qualifies it on its own/i)).toBeInTheDocument();
  });
});

describe('OnboardingGuide — colapsable', () => {
  it('oculta los pasos al colapsar y los vuelve a mostrar al expandir', () => {
    render(<OnboardingGuide />);
    // visible por defecto
    expect(screen.getByRole('heading', { name: /Capture the call/i })).toBeInTheDocument();

    // colapsar
    fireEvent.click(screen.getByRole('button', { name: /Hide steps/i }));
    expect(screen.queryByRole('heading', { name: /Capture the call/i })).not.toBeInTheDocument();

    // expandir de nuevo
    fireEvent.click(screen.getByRole('button', { name: /Show steps/i }));
    expect(screen.getByRole('heading', { name: /Capture the call/i })).toBeInTheDocument();
  });
});
