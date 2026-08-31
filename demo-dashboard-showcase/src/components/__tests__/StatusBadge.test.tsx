/**
 * TESTS StatusBadge — badge de estado con color semántico + icono (FSM citas + pacientes).
 */
import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import StatusBadge from '../ui/StatusBadge';
import { strings, renderWith } from './helpers';

describe('StatusBadge', () => {
 it('muestra el label traducido del estado de cita', () => {
 renderWith(<StatusBadge value="confirmed" strings={strings} />);
 expect(screen.getByText(strings.status.confirmed)).toBeInTheDocument();
 });

 it('muestra el label traducido del estado de paciente', () => {
 renderWith(<StatusBadge value="activo" strings={strings} />);
 expect(screen.getByText(strings.status.activo)).toBeInTheDocument();
 });

 it('expone role=status con aria-label', () => {
 renderWith(<StatusBadge value="no_show" strings={strings} />);
 expect(screen.getByRole('status')).toHaveAttribute('aria-label', strings.status.no_show);
 });
});
