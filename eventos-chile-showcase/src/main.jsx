// Punto de entrada principal
// ORDEN CRÍTICO DE IMPORTS: React primero, CSS después, App al final
// Esto garantiza que React esté disponible antes de cualquier librería que lo necesite

// 1. React Core (SIEMPRE PRIMERO)
import React from 'react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// 2. Estilos Globales (CSS) - Después de React
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';

// 3. App y Librerías - Al final
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

// Verificar que el root existe
const rootElement = document.getElementById('root');
if (!rootElement) {
    throw new Error('No se encontró el elemento #root');
}

// Renderizo la app envuelta en StrictMode (detecta problemas en desarrollo)
// y en AuthProvider (comparte datos de sesión en todos los componentes)
const root = createRoot(rootElement);
root.render(
    <StrictMode>
        <AuthProvider>
            <App />
        </AuthProvider>
    </StrictMode>
);
