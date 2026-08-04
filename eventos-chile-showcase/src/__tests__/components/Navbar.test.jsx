import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { AuthProvider } from '../../context/AuthContext';

// Mocks
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => vi.fn(),
    };
});

vi.mock('../../utils/jwtUtils', () => ({
    isTokenExpired: vi.fn().mockReturnValue(false),
    isTokenInvalid: vi.fn().mockReturnValue(false)
}));


const renderWithContext = (ui, authValue = {}) => {
    return render(
        <BrowserRouter>
            <AuthProvider value={authValue}>
                {ui}
            </AuthProvider>
        </BrowserRouter>
    );
};

describe('Navbar Component', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('debería renderizar logo y enlaces públicos para usuario no autenticado', async () => {
        renderWithContext(<Navbar />);

        await waitFor(() => {
            expect(screen.getByText('Eventos Chile')).toBeInTheDocument();
            expect(screen.getByText('Inicio')).toBeInTheDocument();
            expect(screen.getByText('Eventos')).toBeInTheDocument();
            expect(screen.getByText(/Iniciar sesi.n/i)).toBeInTheDocument();
        });
    });

    it('debería mostrar menú de usuario cuando está autenticado', async () => {
        // Simular usuario en localStorage
        localStorage.setItem('user-logged', 'Test User');
        localStorage.setItem('user-role', 'USER');
        const user = { name: 'Test User', rol: 'USER' };
        localStorage.setItem('user-data', JSON.stringify(user));
        localStorage.setItem('jwt_token', 'fake-token');

        renderWithContext(<Navbar />);

        await waitFor(() => {
            // Buscar por el nombre de usuario de forma más flexible
            expect(screen.getByText(/Test User/i)).toBeInTheDocument();
            expect(screen.queryByText(/Iniciar Sesi.n/i)).not.toBeInTheDocument();
        });
    });

    it('debería mostrar opción "Panel Super Admin" solo para rol SUPER_ADMIN', () => {
        localStorage.setItem('user-logged', 'Super Admin');
        // Importante: El componente Navbar lee el rol del localStorage o del contexto
        // En este test asumimos que lo lee de localStorage o del token decodificado
        // Ajustamos el mock para que coincida con la lógica del componente
        const user = { name: 'Super Admin', rol: 'SUPER_ADMIN' };
        localStorage.setItem('user-data', JSON.stringify(user));
        localStorage.setItem('jwt_token', 'fake-token');

        renderWithContext(<Navbar />);

        // Verificar el dropdown
        const userDropdown = screen.getByText('Super Admin');
        fireEvent.click(userDropdown);

        expect(screen.getByText('Panel Super Admin')).toBeInTheDocument();
    });

    it('debería cerrar sesión correctamente', () => {
        localStorage.setItem('user-logged', 'User Saliente');
        localStorage.setItem('user-data', JSON.stringify({ name: 'User Saliente', rol: 'USER' }));
        localStorage.setItem('jwt_token', 'fake-token');
        renderWithContext(<Navbar />);

        const userDropdown = screen.getByText('User Saliente');
        fireEvent.click(userDropdown);

        const logoutButton = screen.getByText('Cerrar Sesión');
        fireEvent.click(logoutButton);

        // Verificar que se limpió el localStorage (mockear la función de logout si es necesaria)
        expect(localStorage.getItem('user-logged')).toBeNull();
    });
});
