/**
 * Servicio de Inteligencia Artificial - Aula Viva
 * Implementa estrategia de fallback robusta para llamadas a Gemini API.
 *
 * Estrategia:
 * 1. Intentar Gemini 3.6 Flash (Modelo primario)
 * 2. Si falla (429, 5xx, timeout) -> Fallback a Gemini 3.1 Flash Lite
 * 3. Si ambos fallan -> Lanzar error descriptivo
 *
 * FIX 2026-08-04 (authorization keys AQ.Ab8...):
 * - Google migró las API keys a "authorization keys" (nuevo estándar, obligatorio
 *   desde sept 2026). Estas SOLO se autentican via header `X-goog-api-key`, NO por
 *   query param `?key=`. Antes se enviaba en la URL, lo que devolvía 400
 *   API_KEY_INVALID. Por eso "la API ya no funcionaba".
 * - Se conservan los modelos válidos para generateContent de texto (tutor pedagógico).
 *
 * @see https://ai.google.dev/gemini-api/docs/generate-content/api-key
 */

// Modelos de texto de salida válidos para la authorization key AQ.Ab8...
// VERIFICADO EN VIVO 2026-08-04 con la key real:
//   gemini-3.6-flash      → OK (responde)
//   gemini-3.1-flash-lite → OK (responde)
//   gemini-2.5-flash      → 404 "no longer available to new users" (MUERTO)
//   gemini-3-flash-preview→ no existe en este proyecto (403)
// Por eso el orden: 3.6-flash primario, 3.1-flash-lite fallback directo.
const MODELS_PRIORITY = [
    "gemini-3.6-flash",
    "gemini-3.1-flash-lite"
];

const GEMINI_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta";

export const AIService = {
    async generateContent(apiKey: string, history: Array<{ role: 'user' | 'model', text: string }>, systemPrompt: string, fetchImpl: typeof fetch = fetch): Promise<{ text: string, model: string }> {
        // Construct full conversation history:
        // 1. System Prompt (context) se trata como primer mensaje 'user' para groundear el modelo.
        const contents = [
            {
                role: "user",
                parts: [{ text: systemPrompt }]
            },
            ...history.map(msg => ({
                role: msg.role === 'user' ? 'user' : 'model',
                parts: [{ text: msg.text }]
            }))
        ];

        let lastErr: unknown;

        for (const model of MODELS_PRIORITY) {
            try {
                console.log(`[AI-Service] Intentando conectar con modelo: ${model}...`);

                const response = await fetchImpl(
                    `${GEMINI_ENDPOINT}/models/${model}:generateContent`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "X-goog-api-key": apiKey, // FIX: auth key por header, no query param
                        },
                        body: JSON.stringify({ contents })
                    }
                );

                const data = await response.json().catch(() => ({}));

                if (!response.ok) {
                    const errMsg = String(data.error?.message ?? '');
                    // 400/403 con "API key" = key inválida/restringida → NO es transitorio,
                    // corta la cadena de fallback (no tiene sentido reintentar con otro modelo).
                    if ((response.status === 400 || response.status === 403) && errMsg.includes('API key')) {
                        console.warn(`[AI-Service] API Key inválida/restringida en ${model}:`, response.status, data.error);
                        throw new Error('API Key inválida');
                    }
                    console.warn(`[AI-Service] Fallo en ${model}:`, response.status, data.error);
                    throw new Error(`Error HTTP ${response.status}`);
                }

                if (!data.candidates || data.candidates.length === 0) {
                    throw new Error('Sin candidatos en respuesta');
                }

                const text = data.candidates[0].content?.parts?.[0]?.text;
                if (!text) {
                    throw new Error('Respuesta vacía sin texto');
                }

                console.log(`[AI-Service] Éxito con ${model}`);
                return { text, model };

            } catch (err: any) {
                console.warn(`[AI-Service] Error con modelo ${model}: ${err?.message}`);
                lastErr = err;
                if (err instanceof Error && err.message === 'API Key inválida') {
                    throw err; // corta, no reintenta otros modelos
                }
            }
        }

        throw lastErr instanceof Error
            ? lastErr
            : new Error("Todos los modelos de IA fallaron. Verifica tu conexión o cuota.");
    }
};
