/**
 * TESTS ModeBadge — badge MODO DEMO siempre visible .
 */
import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import ModeBadge from '../ModeBadge';
import { strings, renderWith } from './helpers';

describe('ModeBadge', () => {
 it('muestra "MODO DEMO" siempre visible', () => {
 renderWith(<ModeBadge strings={strings} />);
 expect(screen.getByText(strings.demoBadge.label)).toBeInTheDocument();
 });

 it('expone role=status con aria-label', () => {
 renderWith(<ModeBadge strings={strings} />);
 expect(screen.getByRole('status')).toHaveAttribute('aria-label', strings.demoBadge.label);
 });
});
