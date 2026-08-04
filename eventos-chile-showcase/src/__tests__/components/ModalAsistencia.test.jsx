import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ModalAsistencia from '../../components/ModalAsistencia';
import * as asistenciaService from '../../services/apiAsistencia';

// Mock servicios
vi.mock('../../services/apiAsistencia', () => ({
    confirmarAsistencia: vi.fn()
}));

const mockProps = {
    show: true,
    handleClose: vi.fn(),
    evento: { id: 1, titulo: 'Evento Test' },
    onConfirm: vi.fn()
};

describe('ModalAsistencia Component', () => {
    it('debería renderizar el formulario correctamente', () => {
        render(<ModalAsistencia {...mockProps} />);

        expect(screen.getByText('Confirmar Asistencia como Invitado')).toBeInTheDocument();
        expect(screen.getByLabelText(/Nombre Completo/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/RUT/i)).toBeInTheDocument();
        // etc
    });

    it('debería validar campos vacíos', async () => {
        render(<ModalAsistencia {...mockProps} />);

        const submitBtn = screen.getByText('Confirmar Asistencia');
        fireEvent.click(submitBtn);

        await waitFor(() => {
            // Verificar mensajes de error HTML5 o visuales
            const form = screen.getByRole('form'); // Asumiendo que tiene role=form o es un <form>
            expect(form).not.toBeValid(); // Pseudo-check
            // O verificar clases de error
            expect(screen.getByLabelText(/Nombre/i)).toBeInvalid();
        });
    });

    it('debería llamar a la API al enviar datos válidos', async () => {
        asistenciaService.confirmarAsistencia.mockResolvedValue({ status: 201 });

        render(<ModalAsistencia {...mockProps} />);

        fireEvent.change(screen.getByLabelText(/Nombre/i), { target: { value: 'Juan' } });
        fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'juan@test.com' } });
        fireEvent.change(screen.getByLabelText(/RUT/i), { target: { value: '12.345.678-9' } }); // RUT válido

        fireEvent.click(screen.getByText('Confirmar Asistencia'));

        await waitFor(() => {
            expect(asistenciaService.confirmarAsistencia).toHaveBeenCalled();
            expect(mockProps.onConfirm).toHaveBeenCalled();
            expect(mockProps.handleClose).toHaveBeenCalled();
        });
    });
});
