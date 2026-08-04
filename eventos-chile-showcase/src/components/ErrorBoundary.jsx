// Error Boundary para prevenir crashes en producción
import React from 'react';
import { logger } from '../utils/logger';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        logger.error('ErrorBoundary capturó un error:', error, errorInfo);
        this.setState({
            error: error,
            errorInfo: errorInfo
        });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    minHeight: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '2rem',
                    background: '#050505',
                    color: 'white',
                    textAlign: 'center'
                }}>
                    <h1 style={{ fontSize: 'clamp(2rem, 5vw, 4rem)', marginBottom: '1rem' }}>
                        Algo salió mal
                    </h1>
                    <p style={{ fontSize: 'clamp(1rem, 2vw, 1.2rem)', color: '#888', marginBottom: '2rem' }}>
                        Lo sentimos, ha ocurrido un error inesperado.
                    </p>
                    <button
                        onClick={() => {
                            this.setState({ hasError: false, error: null, errorInfo: null });
                            window.location.href = '/';
                        }}
                        style={{
                            padding: '1rem 2rem',
                            background: '#6C63FF',
                            color: 'white',
                            border: 'none',
                            borderRadius: '50px',
                            fontSize: '1rem',
                            cursor: 'pointer',
                            fontWeight: '600'
                        }}
                    >
                        Volver al inicio
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;

