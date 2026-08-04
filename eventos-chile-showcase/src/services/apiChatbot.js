/**
 * Servicio de Chatbot - MODO DEMO ACADÉMICO (SOLO FRONTEND)
 * 
 * En esta versión de demostración, la conexión con el Backend y Gemini AI
 * está desactivada intencionalmente para mostrar la interfaz sin dependencias de servidor.
 * 
 * La arquitectura original soporta integración completa, pero aquí se simula
 * para efectos de presentación académica estática en Vercel.
 */

const RESPUESTA_DEMO = `🤖 **MODO DEMO ACADÉMICO**

Esta es una versión de demostración **Full Frontend** de Eventos Chile.

Aunque la arquitectura del sistema incluye un Backend completo y conexión con Gemini AI, estos servicios están desactivados en este despliegue para garantizar la permanencia de la demo estática.

**Funcionalidades disponibles:**
✅ Navegación completa
✅ Interfaz de Eventos y Detalles
✅ Animaciones y Efectos Visuales
❌ Procesamiento de IA en tiempo real (Desactivado)

¡Disfruta explorando la interfaz!`;

export const enviarMensaje = async (mensaje, contexto = []) => {
    // Simular pequeño delay de red para realismo
    await new Promise(r => setTimeout(r, 800));

    return {
        success: true,
        data: {
            respuesta: RESPUESTA_DEMO
        }
    };
};
