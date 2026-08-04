import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { describe, expect, test } from 'vitest'
import EventCard from '../../components/EventCard'
import { AuthProvider } from '../../context/AuthContext'

const mockEvento = {
    id: 'evt_1234',
    titulo: 'Evento de Prueba',
    descripcion: 'Descripción del evento de prueba',
    fecha: '2024-03-15',
    lugar: 'Santiago',
    tipo: 'Presencial',
    precio: 10000,
    capacidad: 100,
    creadoPor: 'test@test.com',
    fechaCreacion: new Date().toISOString()
}

describe('EventCard Component', () => {
    test('renderiza correctamente la información del evento', () => {
        render(
            <BrowserRouter>
                <AuthProvider>
                    <EventCard evento={mockEvento} />
                </AuthProvider>
            </BrowserRouter>
        )

        // Usar getAllByText ya que el título aparece en ambas caras
        expect(screen.getAllByText(mockEvento.titulo)[0]).toBeInTheDocument()

        // Usar getAllByText para elementos que aparecen múltiples veces
        const lugarElements = screen.getAllByText((content, element) => {
            return element.textContent.includes('Santiago')
        })
        expect(lugarElements.length).toBeGreaterThan(0)

        expect(screen.getByText('Presencial')).toBeInTheDocument()
    })

    test('muestra el modal al hacer clic en el botón de detalles', async () => {
        render(
            <BrowserRouter>
                <AuthProvider>
                    <EventCard evento={mockEvento} />
                </AuthProvider>
            </BrowserRouter>
        )

        const user = userEvent.setup()

        // Simular click en la tarjeta para voltear
        const cardContainer = screen.getByText(mockEvento.titulo).closest('.tarjeta-evento-3d');
        await user.click(cardContainer); // Voltear

        // Esperar a que la cara posterior sea visible
        // La descripción puede tener '...' al final por truncado, buscamos substring
        const descElements = await screen.findAllByText((content, element) => {
            return content.includes('Descripción del evento de prueba');
        });
        expect(descElements.length).toBeGreaterThan(0);

        // Verificamos etiqueta
        expect(screen.getByText('Descripción:')).toBeInTheDocument()

        // La fecha se formatea, buscar parte del formato (ej: marzo)
        expect(screen.getByText(/15 de marzo/i)).toBeInTheDocument()
    })
})
