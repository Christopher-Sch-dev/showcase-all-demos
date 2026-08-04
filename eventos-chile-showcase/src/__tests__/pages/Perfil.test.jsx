import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Perfil from '../../pages/Perfil';
import * as userService from '../../services/apiUsuarios';
import * as authService from '../../services/apiAuth';
import * as eventoService from '../../services/apiEventos';
import * as asistenciaService from '../../services/apiAsistencia';

// Mocks
vi.mock('../../services/apiUsuarios', () => ({
    obtenerPerfil: vi.fn(),
    actualizarPerfil: vi.fn()
}));

vi.mock('../../services/apiAuth', () => ({
    eliminarCuenta: vi.fn()
}));

vi.mock('../../services/apiEventos', () => ({
    obtenerEventosPorUsuario: vi.fn().mockResolvedValue({ success: true, data: [] })
}));

vi.mock('../../services/apiAsistencia', () => ({
    obtenerAsistenciasPorUsuario: vi.fn().mockResolvedValue({ success: true, data: [] }),
    obtenerAsistenciasPorEvento: vi.fn().mockResolvedValue({ success: true, data: [] })
}));

vi.mock('../../services/supabaseStorage', () => ({
    subirImagen: vi.fn()
}));

vi.mock('../../utils/jwtUtils', () => ({
    isTokenExpired: vi.fn().mockReturnValue(false),
    isTokenInvalid: vi.fn().mockReturnValue(false)
}));



const mockUser = {
    id: 1,
    nombre: 'Usuario Test',
    email: 'test@test.com',
    rut: '12.345.678-9',
    region: 'Metropolitana',
    comuna: 'Santiago'
};

import { AuthProvider } from '../../context/AuthContext';

// Mock simple de AuthContext ya que usamos mocks de servicios
const renderWithContext = (ui) => {
    return render(
        <BrowserRouter>
            <AuthProvider>
                {ui}
            </AuthProvider>
        </BrowserRouter>
    );
};

describe('Page: Perfil', () => {
    beforeEach(() => {
        userService.obtenerPerfil.mockResolvedValue({ success: true, data: mockUser });
        authService.eliminarCuenta.mockResolvedValue({ success: true, message: 'Cuenta eliminada' });
        // Asegurar valores por defecto para evitar errores
        eventoService.obtenerEventosPorUsuario.mockResolvedValue({ success: true, data: [] });
        asistenciaService.obtenerAsistenciasPorUsuario.mockResolvedValue({ success: true, data: [] });

        localStorage.setItem('user-data', JSON.stringify(mockUser));
        localStorage.setItem('jwt_token', 'fake-token');
    });

    it('debería cargar y mostrar datos del usuario', async () => {
        renderWithContext(<Perfil />);

        await waitFor(() => {
            // Se muestra como texto, hay múltiples ocurrencias, buscar el heading principal
            expect(screen.getByRole('heading', { name: 'Usuario Test' })).toBeInTheDocument();
            expect(screen.getByText('test@test.com')).toBeInTheDocument();
        });
    });

    it('debería permitir editar el perfil', async () => {
        userService.actualizarPerfil.mockResolvedValue({ success: true, data: { ...mockUser, nombre: 'Nuevo Nombre' } });

        renderWithContext(<Perfil />);
        await waitFor(() => screen.getByText('Usuario Test')); // Esperar a que cargue el texto

        // Cambiar a modo edición
        const editBtn = screen.getByText('Editar mi información');
        fireEvent.click(editBtn);

        // Ahora sí buscar el input
        const nameInput = screen.getByDisplayValue('Usuario Test');
        fireEvent.change(nameInput, { target: { value: 'Nuevo Nombre' } });

        // Guardar
        const saveBtn = screen.getByText('Guardar Cambios');
        fireEvent.click(saveBtn);

        await waitFor(() => {
            expect(userService.actualizarPerfil).toHaveBeenCalledWith(expect.objectContaining({
                nombre: 'Nuevo Nombre'
            }));
            // Verificar mensaje de éxito (toast o alerta)
            expect(screen.getByText(/Perfil actualizado/i)).toBeInTheDocument();
        });
    });

    it('debería mostrar modal de confirmación al eliminar cuenta y completar flujo', async () => {
        renderWithContext(<Perfil />);
        await waitFor(() => screen.getByRole('heading', { name: 'Usuario Test' }));

        const deleteBtn = screen.getByText('Eliminar mi cuenta');
        fireEvent.click(deleteBtn);

        // Verificar que aparece modal paso 1
        expect(screen.getByText('Continuar')).toBeInTheDocument();

        // Confirmar paso 1
        const continueBtn = screen.getByText('Continuar');
        fireEvent.click(continueBtn);

        // Paso 2: Input ELIMINAR
        await waitFor(() => expect(screen.getByPlaceholderText(/Escribe ELIMINAR/i)).toBeInTheDocument());

        const inputEliminar = screen.getByPlaceholderText(/Escribe ELIMINAR/i);
        fireEvent.change(inputEliminar, { target: { value: 'ELIMINAR' } });

        // Click eliminar final
        // El botón ahora dice "Eliminar Cuenta"
        const buttons = screen.getAllByText('Eliminar Cuenta');
        const finalDeleteBtn = buttons[buttons.length - 1];
        fireEvent.click(finalDeleteBtn);

        await waitFor(() => {
            expect(authService.eliminarCuenta).toHaveBeenCalled();
        });
    });
});
