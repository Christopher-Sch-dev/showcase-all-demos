/**
 * TESTS PatientTable — paginación (8 filas) + filtros + CRUD .
 */
import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import PatientTable from '../PatientTable';
import { strings, seedState, renderWith, mockLocalStorage } from './helpers';

describe('PatientTable', () => {
 it('pagina 8 filas por página con contador "X of Y"', () => {
 mockLocalStorage();
 renderWith(<PatientTable state={seedState} strings={strings} onStateChange={() => {}} />);
 // Seed tiene 9 pacientes → 2 páginas (8 + 1).
 expect(screen.getByText(strings.table.pageOf.replace('{current}', '1').replace('{total}', '2'))).toBeInTheDocument();
 // Primera página muestra 8 filas de pacientes.
 const rows = screen.getAllByRole('row');
 // header + 8 filas = 9.
 expect(rows.length).toBe(9);
 });

 it('filtra por estado', () => {
 mockLocalStorage();
 renderWith(<PatientTable state={seedState} strings={strings} onStateChange={() => {}} />);
 fireEvent.change(screen.getByLabelText(strings.table.allStatuses), { target: { value: 'inactivo' } });
 // Seed tiene 2 pacientes inactivos (P6, P7).
 expect(screen.getByText('Diego Castro')).toBeInTheDocument();
 expect(screen.getByText('Francisca Herrera')).toBeInTheDocument();
 expect(screen.queryByText('María Fernández')).not.toBeInTheDocument();
 });

 it('filtra por tratamiento', () => {
 mockLocalStorage();
 renderWith(<PatientTable state={seedState} strings={strings} onStateChange={() => {}} />);
 fireEvent.change(screen.getByLabelText(strings.table.allTreatments), { target: { value: 'Implante' } });
 expect(screen.getByText('Andrés Rojas')).toBeInTheDocument();
 expect(screen.queryByText('María Fernández')).not.toBeInTheDocument();
 });

 it('crea un paciente vía CRUD y persiste', () => {
 const ls = mockLocalStorage();
 const onStateChange = vi.fn();
 renderWith(<PatientTable state={seedState} strings={strings} onStateChange={onStateChange} />);
 fireEvent.click(screen.getByRole('button', { name: strings.table.newPatient }));
 fireEvent.change(screen.getByLabelText(new RegExp(strings.form.name)), { target: { value: 'Nuevo Paciente' } });
 fireEvent.change(screen.getByLabelText(new RegExp(strings.form.email)), { target: { value: 'nuevo@example.com' } });
 fireEvent.change(screen.getByLabelText(new RegExp(strings.form.phone)), { target: { value: '+56 9 1111 2222' } });
 fireEvent.click(screen.getByRole('button', { name: strings.form.save }));
 // onStateChange llamado con estado que incluye el nuevo paciente.
 expect(onStateChange).toHaveBeenCalled();
 const next = onStateChange.mock.calls[0][0] as typeof seedState;
 expect(next.pacientes.some((p) => p.nombre === 'Nuevo Paciente')).toBe(true);
 // Persistido en localStorage.
 expect(ls.getItem('demo-dashboard:v1')).toContain('Nuevo Paciente');
 });
});
