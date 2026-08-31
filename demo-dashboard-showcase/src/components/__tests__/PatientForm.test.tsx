/**
 * TESTS PatientForm — validación inline + submit .
 */
import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import PatientForm from '../PatientForm';
import { strings, renderWith } from './helpers';

describe('PatientForm', () => {
 it('muestra error inline si el email es inválido (sin enviar)', () => {
 const onSubmit = vi.fn();
 renderWith(<PatientForm strings={strings} onSubmit={onSubmit} onCancel={() => {}} />);
 fireEvent.change(screen.getByLabelText(new RegExp(strings.form.email)), { target: { value: 'not-an-email' } });
 fireEvent.change(screen.getByLabelText(new RegExp(strings.form.name)), { target: { value: 'Ana' } });
 fireEvent.change(screen.getByLabelText(new RegExp(strings.form.phone)), { target: { value: '+56 9 1234 5678' } });
 fireEvent.click(screen.getByRole('button', { name: strings.form.save }));
 expect(screen.getByRole('alert')).toHaveTextContent(strings.form.errors.emailInvalid);
 expect(onSubmit).not.toHaveBeenCalled();
 });

 it('muestra error inline si el nombre está vacío', () => {
 const onSubmit = vi.fn();
 renderWith(<PatientForm strings={strings} onSubmit={onSubmit} onCancel={() => {}} />);
 fireEvent.change(screen.getByLabelText(new RegExp(strings.form.email)), { target: { value: 'ana@example.com' } });
 fireEvent.change(screen.getByLabelText(new RegExp(strings.form.phone)), { target: { value: '+56 9 1234 5678' } });
 fireEvent.click(screen.getByRole('button', { name: strings.form.save }));
 expect(screen.getByRole('alert')).toHaveTextContent(strings.form.errors.nameRequired);
 expect(onSubmit).not.toHaveBeenCalled();
 });

 it('envía el draft válido al submit', () => {
 const onSubmit = vi.fn();
 renderWith(<PatientForm strings={strings} onSubmit={onSubmit} onCancel={() => {}} />);
 fireEvent.change(screen.getByLabelText(new RegExp(strings.form.name)), { target: { value: 'Ana Rojas' } });
 fireEvent.change(screen.getByLabelText(new RegExp(strings.form.email)), { target: { value: 'ana@example.com' } });
 fireEvent.change(screen.getByLabelText(new RegExp(strings.form.phone)), { target: { value: '+56 9 1234 5678' } });
 fireEvent.click(screen.getByRole('button', { name: strings.form.save }));
 expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ nombre: 'Ana Rojas', email: 'ana@example.com' }));
 });
});
