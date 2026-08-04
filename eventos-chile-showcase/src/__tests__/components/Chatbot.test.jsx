import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Chatbot from '../../components/Chatbot';
import * as chatbotService from '../../services/apiChatbot';

// Mock del servicio de API
vi.mock('../../services/apiChatbot', () => ({
    enviarMensajeChatbot: vi.fn()
}));

describe('Chatbot Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('debería estar cerrado inicialmente y abrirse al hacer click', () => {
        render(<Chatbot />);

        // Buscar el botón flotante (usando una clase o aria-label si existe, o por el icono)
        // Asumiendo que tiene un rol de botón
        const toggleButton = screen.getByRole('button'); // Puede necesitar ser más específico
        expect(screen.queryByText('Asistente Virtual')).not.toBeInTheDocument();

        fireEvent.click(toggleButton);

        expect(screen.getByText('Asistente Virtual')).toBeInTheDocument();
    });

    it('debería enviar mensaje y mostrar respuesta', async () => {
        const mockResponse = { respuesta: 'Hola, soy el asistente.' };
        chatbotService.enviarMensajeChatbot.mockResolvedValue(mockResponse);

        render(<Chatbot />);

        // Abrir chat
        const toggleButton = screen.getByRole('button');
        fireEvent.click(toggleButton);

        // Escribir mensaje
        const input = screen.getByPlaceholderText(/Escribe tu consulta.../i);
        fireEvent.change(input, { target: { value: 'Hola bot' } });

        // Enviar
        const sendButton = screen.getByRole('button', { name: /enviar/i }); // Ajustar selector según icono
        fireEvent.click(sendButton);

        // Verificar loading (opcional)
        // expect(screen.getByText('Escribiendo...')).toBeInTheDocument();

        // Verificar respuesta
        await waitFor(() => {
            expect(screen.getByText('Hola, soy el asistente.')).toBeInTheDocument();
        });
    });

    it('debería manejar errores de la API', async () => {
        chatbotService.enviarMensajeChatbot.mockRejectedValue(new Error('Error API'));

        render(<Chatbot />);

        // Abrir chat
        fireEvent.click(screen.getByRole('button'));

        // Enviar mensaje
        const input = screen.getByPlaceholderText(/Escribe tu consulta.../i);
        fireEvent.change(input, { target: { value: 'Error trigger' } });
        // Simular Enter
        fireEvent.keyDown(input, { key: 'Enter', code: 'Enter', charCode: 13 });

        await waitFor(() => {
            expect(screen.getByText(/Lo siento, tuve un problema/i)).toBeInTheDocument();
        });
    });
});
