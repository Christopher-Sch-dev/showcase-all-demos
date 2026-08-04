import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Eventos from '../../pages/Eventos';
import * as eventService from '../../services/apiEventos';

// Mocks
vi.mock('../../services/apiEventos', () => ({
    obtenerEventos: vi.fn()
}));

import { AuthProvider } from '../../context/AuthContext';

// Mock Link de react-router
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        Link: ({ children, to }) => <a href={to}>{children}</a>
    };
});

describe('Page: Eventos', () => {
    const mockEventos = [
        { id: 1, titulo: 'Rock en Conce', categoria: 'Música', region: 'Biobío', tipo: 'Presencial', fecha: '2024-12-01T10:00:00Z', precio: 10000, capacidad: 100, totalAsistentes: 10, fechaCreacion: '2024-01-01', description: 'desc', imagen: 'img.jpg' },
        { id: 2, titulo: 'Teatro a Mil', categoria: 'Teatro', region: 'Metropolitana', tipo: 'Presencial', fecha: '2024-12-02T10:00:00Z', precio: 5000, capacidad: 50, totalAsistentes: 5, fechaCreacion: '2024-01-01', description: 'desc', imagen: 'img2.jpg' },
        { id: 3, titulo: 'Curso React', categoria: 'Tecnología', region: 'Online', tipo: 'Streaming', fecha: '2024-12-03T10:00:00Z', precio: 0, capacidad: 200, totalAsistentes: 100, fechaCreacion: '2024-01-01', description: 'desc', imagen: 'img3.jpg' }
    ];

    beforeEach(() => {
        eventService.obtenerEventos.mockResolvedValue({ success: true, data: mockEventos });
        localStorage.clear();
    });

    const renderWithContext = (component) => {
        return render(
            <BrowserRouter>
                <AuthProvider>
                    {component}
                </AuthProvider>
            </BrowserRouter>
        );
    };

    it('debería listar todos los eventos inicialmente', async () => {
        renderWithContext(<Eventos />);

        await waitFor(() => {
            expect(screen.getByText('Rock en Conce')).toBeInTheDocument();
            expect(screen.getByText('Teatro a Mil')).toBeInTheDocument();
            expect(screen.getByText('Curso React')).toBeInTheDocument();
        });
    });

    it('debería filtrar por categoría', async () => {
        renderWithContext(<Eventos />);

        // Esperar carga
        await waitFor(() => screen.getByText('Rock en Conce'));

        // Seleccionar categoría Música
        const selectCat = screen.getByLabelText(/Categoría/i); // Asegurarse que el label existe
        fireEvent.change(selectCat, { target: { value: 'Música' } });

        // Teatro debería desaparecer
        await waitFor(() => {
            expect(screen.getByText('Rock en Conce')).toBeInTheDocument();
            expect(screen.queryByText('Teatro a Mil')).not.toBeInTheDocument();
        });
    });

    it('debería filtrar por búsqueda de texto', async () => {
        renderWithContext(<Eventos />);
        await waitFor(() => screen.getByText('Rock en Conce'));

        const searchInput = screen.getByPlaceholderText(/Buscar evento/i); // Ajustar placeholder
        fireEvent.change(searchInput, { target: { value: 'React' } });

        await waitFor(() => {
            expect(screen.getByText('Curso React')).toBeInTheDocument();
            expect(screen.queryByText('Rock en Conce')).not.toBeInTheDocument();
        });
    });
});
