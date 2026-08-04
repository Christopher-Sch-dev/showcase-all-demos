// Componente profesional de crop de imagen circular
import { useEffect, useRef, useState } from 'react';
import '../styles/imageCropper.css';
import { logger } from '../utils/logger';
import { showError } from '../utils/toast';

function ImageCropper({ imageSrc, onCrop, onCancel }) {
    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
    const containerRef = useRef(null);
    const imageRef = useRef(null);

    useEffect(() => {
        if (imageSrc) {
            // Resetear posición y escala al cargar nueva imagen
            setScale(1);
            setPosition({ x: 0, y: 0 });

            // Cargar imagen para obtener dimensiones
            const img = new Image();
            img.onload = () => {
                setImageSize({ width: img.width, height: img.height });
            };
            img.src = imageSrc;
        }
    }, [imageSrc]);

    const handleMouseDown = (e) => {
        e.preventDefault();
        setIsDragging(true);
        setDragStart({
            x: e.clientX - position.x,
            y: e.clientY - position.y
        });
    };

    const handleMouseMove = (e) => {
        if (!isDragging) return;
        e.preventDefault();

        const newX = e.clientX - dragStart.x;
        const newY = e.clientY - dragStart.y;

        // Limitar movimiento dentro del área visible
        if (containerRef.current && imageRef.current) {
            const containerSize = 300;
            const scaledWidth = imageSize.width * scale;
            const scaledHeight = imageSize.height * scale;

            const maxX = Math.max(0, (scaledWidth - containerSize) / 2);
            const maxY = Math.max(0, (scaledHeight - containerSize) / 2);

            setPosition({
                x: Math.max(-maxX, Math.min(maxX, newX)),
                y: Math.max(-maxY, Math.min(maxY, newY))
            });
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleZoom = (delta) => {
        const newScale = Math.max(0.5, Math.min(3, scale + delta));
        setScale(newScale);

        // Ajustar posición para mantener el crop centrado
        const containerSize = 300;
        const scaledWidth = imageSize.width * newScale;
        const scaledHeight = imageSize.height * newScale;
        const maxX = Math.max(0, (scaledWidth - containerSize) / 2);
        const maxY = Math.max(0, (scaledHeight - containerSize) / 2);

        setPosition({
            x: Math.max(-maxX, Math.min(maxX, position.x)),
            y: Math.max(-maxY, Math.min(maxY, position.y))
        });
    };

    const getCroppedImage = () => {
        if (!imageRef.current || !containerRef.current || imageSize.width === 0) return null;

        const canvas = document.createElement('canvas');
        const outputSize = 300; // Tamaño final de la imagen circular
        canvas.width = outputSize;
        canvas.height = outputSize;
        const ctx = canvas.getContext('2d');

        const img = new Image();
        return new Promise((resolve, reject) => {
            img.onload = () => {
                try {
                    const containerSize = 300;
                    const cropRadius = containerSize / 2;

                    // Calcular el área visible del crop en la imagen original
                    // La imagen está centrada y luego desplazada por position
                    const centerX = img.width / 2;
                    const centerY = img.height / 2;

                    // Calcular el offset en píxeles de la imagen original
                    const offsetX = position.x / scale;
                    const offsetY = position.y / scale;

                    // Calcular la posición del crop
                    const sourceX = centerX - (cropRadius / scale) + offsetX;
                    const sourceY = centerY - (cropRadius / scale) + offsetY;
                    const sourceSize = (cropRadius * 2) / scale;

                    // Asegurar que el crop esté dentro de los límites
                    const clampedSourceX = Math.max(0, Math.min(img.width - sourceSize, sourceX));
                    const clampedSourceY = Math.max(0, Math.min(img.height - sourceSize, sourceY));
                    const clampedSourceSize = Math.min(
                        sourceSize,
                        img.width - clampedSourceX,
                        img.height - clampedSourceY
                    );

                    // Dibujar círculo
                    ctx.beginPath();
                    ctx.arc(outputSize / 2, outputSize / 2, outputSize / 2, 0, 2 * Math.PI);
                    ctx.clip();

                    // Dibujar imagen recortada
                    ctx.drawImage(
                        img,
                        clampedSourceX,
                        clampedSourceY,
                        clampedSourceSize,
                        clampedSourceSize,
                        0,
                        0,
                        outputSize,
                        outputSize
                    );

                    resolve(canvas.toDataURL('image/png'));
                } catch (error) {
                    reject(error);
                }
            };
            img.onerror = () => reject(new Error('Error al cargar la imagen'));
            img.src = imageSrc;
        });
    };

    const handleConfirm = async () => {
        try {
            const croppedImage = await getCroppedImage();
            if (croppedImage && onCrop) {
                onCrop(croppedImage);
            }
        } catch (error) {
            logger.error('Error al recortar imagen:', error);
            showError('Error al procesar la imagen. Inténtalo de nuevo.');
        }
    };

    if (!imageSrc) return null;

    return (
        <div className="image-cropper-overlay" onClick={onCancel}>
            <div className="image-cropper-container" onClick={(e) => e.stopPropagation()}>
                <div className="image-cropper-header">
                    <h5 className="mb-0">Ajustar Imagen de Perfil</h5>
                    <button
                        type="button"
                        className="btn-close"
                        onClick={onCancel}
                        aria-label="Cerrar"
                    />
                </div>

                <div className="image-cropper-body">
                    <div
                        ref={containerRef}
                        className="image-cropper-preview"
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                    >
                        <div
                            className="image-cropper-mask"
                            style={{
                                width: '300px',
                                height: '300px',
                                borderRadius: '50%',
                                border: '3px solid #0d6efd',
                                boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)'
                            }}
                        />
                        <img
                            ref={imageRef}
                            src={imageSrc}
                            alt="Preview"
                            className="image-cropper-image"
                            style={{
                                transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px)) scale(${scale})`,
                                cursor: isDragging ? 'grabbing' : 'grab'
                            }}
                            draggable={false}
                        />
                    </div>

                    <div className="image-cropper-controls mt-3">
                        <div className="d-flex align-items-center justify-content-center gap-3">
                            <label className="form-label mb-0">Zoom:</label>
                            <button
                                type="button"
                                className="btn btn-sm btn-outline-secondary"
                                onClick={() => handleZoom(-0.1)}
                                disabled={scale <= 0.5}
                            >
                                -
                            </button>
                            <span className="badge bg-secondary" style={{ minWidth: '60px' }}>
                                {Math.round(scale * 100)}%
                            </span>
                            <button
                                type="button"
                                className="btn btn-sm btn-outline-secondary"
                                onClick={() => handleZoom(0.1)}
                                disabled={scale >= 3}
                            >
                                +
                            </button>
                        </div>
                        <small className="text-muted d-block mt-2 text-center">
                            Arrastra la imagen para ajustar la posición • Usa los botones para hacer zoom
                        </small>
                    </div>
                </div>

                <div className="image-cropper-footer">
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={onCancel}
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={handleConfirm}
                    >
                        Aplicar
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ImageCropper;
