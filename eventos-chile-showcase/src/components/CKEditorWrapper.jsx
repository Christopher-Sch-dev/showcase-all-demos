// Editor de texto enriquecido usando React Quill (gratuito)
// Reemplaza CKEditor que tenia licencia expirada
import { useMemo } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

/**
 * Wrapper de React Quill para edicion de descripciones de eventos.
 * Mantiene la misma interfaz que CKEditorWrapper para compatibilidad.
 * 
 * @param {string} value - Contenido HTML actual
 * @param {function} onChange - Callback cuando cambia el contenido
 * @param {string} placeholder - Texto placeholder
 */
export default function CKEditorWrapper({
    value,
    onChange,
    placeholder = 'Escribe la descripción del evento aquí...'
}) {
    // Configuracion del toolbar - similar a CKEditor pero usando Quill
    const modules = useMemo(() => ({
        toolbar: {
            container: [
                // Encabezados
                [{ 'header': [1, 2, 3, false] }],

                // Formato de texto
                ['bold', 'italic', 'underline', 'strike'],

                // Bloques
                ['blockquote', 'code-block'],

                // Listas
                [{ 'list': 'ordered' }, { 'list': 'bullet' }],

                // Indentacion
                [{ 'indent': '-1' }, { 'indent': '+1' }],

                // Colores
                [{ 'color': [] }, { 'background': [] }],

                // Alineacion
                [{ 'align': [] }],

                // Enlaces y multimedia
                ['link', 'image', 'video'],

                // Limpiar formato
                ['clean']
            ]
        },
        clipboard: {
            matchVisual: false
        }
    }), []);

    // Formatos permitidos
    const formats = [
        'header',
        'bold', 'italic', 'underline', 'strike',
        'blockquote', 'code-block',
        'list', 'bullet', 'indent',
        'color', 'background',
        'align',
        'link', 'image', 'video'
    ];

    return (
        <div className="ckeditor-wrapper quill-wrapper">
            <ReactQuill
                theme="snow"
                value={value || ''}
                onChange={onChange}
                modules={modules}
                formats={formats}
                placeholder={placeholder}
                style={{ minHeight: '300px' }}
            />
        </div>
    );
}
