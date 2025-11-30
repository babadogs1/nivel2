
import { GoogleGenAI, Type, Chat, Modality } from "@google/genai";
import { Quiz, Subject, QuizQuestion, StudyPlan, Flashcard } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateLesson = async (subTopic: string) => {
    const prompt = `
    Actúa como un profesor universitario experto, muy didáctico y amigable, especializado en preparar a estudiantes de último año de secundaria para la Prueba de Aptitud Académica (PAA) y el examen de ciencias de la Universidad San Francisco de Quito. Tu objetivo es crear material de estudio claro, conciso, completo y fácil de entender.

    Por favor, genera una lección detallada sobre el siguiente subtema: "${subTopic}".

    **REGLAS DE FORMATO ESTRICTAS (MUY IMPORTANTE):**
    1.  **SEPARACIÓN DE BLOQUES:** DEBES usar una línea en blanco para separar CADA elemento: cada párrafo, cada título, cada subtítulo, cada lista y cada visualización.
    2.  **TÍTULOS PRINCIPALES:** Usa negritas, por ejemplo: \`**1. Introducción Conceptual**\`
    3.  **SUBTÍTULOS:** Usa tres numerales seguido de un espacio, por ejemplo: \`### Explicación Detallada\`
    4.  **LISTAS:** Cada elemento de la lista debe empezar en una nueva línea con un asterisco y un espacio, por ejemplo: \`* Este es un punto.\`
    5.  **ÉNFASIS:** Para enfatizar texto, usa únicamente negritas con dos asteriscos (ej. \`**texto importante**\`). NO uses cursiva con un solo asterisco.
    6.  **FÓRMULAS MATEMÁTicas (CRÍTICO):**
        -   Usa la sintaxis de LaTeX para TODAS las fórmulas, ecuaciones o expresiones matemáticas.
        -   Asegúrate de que el LaTeX sea sintácticamente correcto y compatible con el estándar LaTeX.
        -   Para matemáticas en línea, enciérralas en un solo signo de dólar: \`$ax^2 + bx + c = 0$\`.
        -   Para bloques de ecuaciones, usa un doble signo de dólar: \`$$x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}$$\`.
    7.  **VISUALIZACIONES (IMPORTANTE):**
        -   **Uso de Tablas (Prioritario):** DEBES usar tablas siempre que la información pueda ser organizada, comparada o resumida de forma tabular. Esto incluye, pero no se limita a: comparaciones de conceptos (pros vs. contras), listas de vocabulario con definiciones, resúmenes de fórmulas, clasificaciones o datos estadísticos. Las tablas son cruciales para la claridad.
        -   **Uso de Asistente de Búsqueda Visual:** Para conceptos que necesiten un diagrama, ilustración o gráfico complejo (ej. organelos celulares, figuras geométricas, procesos biológicos), DEBES usar la herramienta de búsqueda de imágenes. NO intentes dibujar con ASCII. En su lugar, proporciona un prompt para que el usuario busque la imagen.
        -   **Para Tablas:** Usa el tag \`[TABLE_DATA]\` y dentro coloca un objeto JSON con "headers" y "rows". El JSON debe estar en una sola línea. Ejemplo: \`[TABLE_DATA]{"headers": ["Concepto", "Definición"], "rows": [["Media", "Promedio aritmético"]]}[/TABLE_DATA]\`
        -   **Para Gráficos (cuando aplique):** Usa el tag \`[CHART_DATA]\` y dentro coloca un objeto JSON compatible con Chart.js ("type", "labels", "datasets", "title"). El JSON debe estar en una sola línea. Ejemplo: \`[CHART_DATA]{"type": "bar", "title": "Resultados", "labels": ["A", "B"], "datasets": [{"label": "Votos", "data": [120, 150]}]}[/CHART_DATA]\`
        -   **Para Búsqueda de Imágenes:** Usa el tag \`[SEARCH_PROMPT]\` y dentro coloca un objeto JSON con una única clave "query". El query debe ser un texto descriptivo, en español, optimizado para que un estudiante lo use en Google Images para encontrar un diagrama o ilustración educativa de alta calidad y con etiquetas claras. **Usa esto generosamente para temas visuales.** Ejemplo: \`[SEARCH_PROMPT]{"query": "diagrama detallado de una célula eucariota con organelos etiquetados para estudiantes de secundaria"}[/SEARCH_PROMPT]\`

    **ESTRUCTURA DE LA LECCIÓN:**
    **1. Introducción Conceptual:** Explicación de qué es el tema y por qué es importante.
    **2. Explicación Detallada:** Desglose de los principios clave. Usa subtítulos (###) y visualizaciones (tablas, gráficos o prompts de búsqueda de imagen) cuando sea apropiado para ilustrar.
    **3. Ejemplos Tipo Examen Resueltos:** 3-4 ejemplos que imiten el examen. **IMPORTANTE:** Estructura cada ejemplo claramente: primero la pregunta, luego las opciones de respuesta listadas verticalmente (una por línea), y finalmente la solución detallada paso a paso.
    **4. Resumen Clave:** Puntos finales a memorizar.

    El tono debe ser motivador y de apoyo. Formatea la respuesta para que sea muy fácil de leer en una página web.
    `;

    const responseStream = await ai.models.generateContentStream({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            temperature: 0.7,
            topP: 0.95,
            topK: 64,
        },
    });
    return responseStream;
};

const generateQuestionBatch = async (prompt: string, pdfPart?: any): Promise<QuizQuestion[]> => {
    const batchSchema = {
        type: Type.OBJECT,
        properties: {
            questions: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        question: { type: Type.STRING },
                        options: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING }
                        },
                        correctAnswerIndex: { type: Type.INTEGER },
                        explanation: { type: Type.STRING }
                    },
                    required: ["question", "options", "correctAnswerIndex", "explanation"]
                }
            }
        },
        required: ["questions"]
    };

    try {
        const contents: any = pdfPart 
            ? { parts: [pdfPart, { text: prompt }] }
            : prompt;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: contents,
            config: {
                temperature: 0.8,
                topP: 0.95,
                topK: 64,
                responseMimeType: 'application/json',
                responseSchema: batchSchema,
            },
        });
        const jsonText = response.text.trim();
        const batchData = JSON.parse(jsonText);
        return batchData.questions || [];
    } catch (error) {
        console.error("Error generating question batch:", error);
        // On failure, return an empty array to not break the loop/promise.
        return [];
    }
};

export const generateQuiz = async (subTopic: string, onProgress: (loaded: number, total: number) => void): Promise<Quiz | null> => {
    // Optimizado: Reducido a 10 preguntas (2 tandas de 5) para una generación más rápida.
    const totalQuestions = 10;
    const batchSize = 5;
    const numBatches = totalQuestions / batchSize;
    onProgress(0, totalQuestions);

    let completedBatches = 0;

    const getPrompt = () => `
    Actúa como un examinador experto. Genera un lote de ${batchSize} preguntas de opción múltiple, únicas y de dificultad variada sobre el subtema: "${subTopic}".
    Cada pregunta debe tener 4 opciones (una correcta), y una explicación detallada.
    Responde únicamente con el formato JSON especificado en el schema.
    `;

    try {
        // Parallel Execution: Create all promises at once
        const promises = Array.from({ length: numBatches }).map(async (_, i) => {
            const batchResult = await generateQuestionBatch(getPrompt());
            
            completedBatches++;
            const simulatedLoaded = Math.min(completedBatches * batchSize, totalQuestions);
            onProgress(simulatedLoaded, totalQuestions);

            if (batchResult.length === 0) {
                 console.warn(`Batch ${i+1} for quiz on "${subTopic}" returned 0 questions.`);
            }
            return batchResult;
        });

        // Wait for all batches to finish simultaneously
        const results = await Promise.all(promises);
        const allQuestions = results.flat();

        if (allQuestions.length < totalQuestions * 0.5) {
            throw new Error(`Failed to generate enough questions. Got ${allQuestions.length}`);
        }

        return { questions: allQuestions.slice(0, totalQuestions) };
    } catch (error) {
        console.error("Error generating quiz:", error);
        return null;
    }
};

export const generateSimulationExam = async (syllabus: Subject, onProgress: (loaded: number, total: number) => void): Promise<Quiz | null> => {
    // Optimizado: Reducido a 30 preguntas (3 tandas de 10) para evitar tiempos de espera excesivos.
    const totalQuestions = 30;
    const batchSize = 10;
    const numBatches = totalQuestions / batchSize;
    onProgress(0, totalQuestions);
    
    const syllabusText = syllabus.topics.map(topic => 
        `  - ${topic.name}:\n${topic.subTopics.map(sub => `    - ${sub.name}`).join('\n')}`
    ).join('\n');

    let completedBatches = 0;

    const getPrompt = () => `
    Actúa como un comité de examinadores de élite. Genera un lote de ${batchSize} preguntas de opción múltiple únicas y de dificultad variada para el examen de admisión "${syllabus.name}".
    Las preguntas deben cubrir de manera equilibrada el programa de estudios general:
    \`\`\`
    ${syllabusText}
    \`\`\`
    Asegúrate de que este lote contribuya a la diversidad general del examen.
    Cada pregunta debe tener 4 opciones (una correcta), y una explicación detallada.
    Responde únicamente con el formato JSON especificado en el schema.
    `;

    try {
        // Parallel Execution for Simulation
        const promises = Array.from({ length: numBatches }).map(async (_, i) => {
            const batchResult = await generateQuestionBatch(getPrompt());
             
             completedBatches++;
             const simulatedLoaded = Math.min(completedBatches * batchSize, totalQuestions);
             onProgress(simulatedLoaded, totalQuestions);

             if (batchResult.length === 0) {
                 console.warn(`Batch ${i+1} for simulation on "${syllabus.name}" returned 0 questions.`);
            }
            return batchResult;
        });

        const results = await Promise.all(promises);
        const allQuestions = results.flat();

        if (allQuestions.length < totalQuestions * 0.5) {
            throw new Error(`Failed to generate enough simulation questions. Got ${allQuestions.length}`);
        }

        return { questions: allQuestions.slice(0, totalQuestions) };
    } catch (error) {
        console.error("Error generating simulation exam:", error);
        return null;
    }
};

export const generateSimulationFromPDF = async (pdfBase64: string, onProgress: (loaded: number, total: number) => void): Promise<Quiz | null> => {
    // Requerimiento del usuario: 80 preguntas.
    const totalQuestions = 80;
    // Para optimizar, haremos 8 tandas de 10 preguntas en paralelo.
    const batchSize = 10;
    const numBatches = totalQuestions / batchSize;
    
    onProgress(0, totalQuestions);
    
    let completedBatches = 0;
    
    const pdfPart = {
        inlineData: {
            mimeType: 'application/pdf',
            data: pdfBase64
        }
    };

    const getPrompt = (batchIndex: number) => `
    Actúa como un examinador experto riguroso. Tienes acceso a un documento PDF.
    
    TU TAREA: Genera un lote de ${batchSize} preguntas de opción múltiple de dificultad ALTA basadas EXCLUSIVAMENTE en el contenido de este documento PDF.
    
    Lote número: ${batchIndex + 1} de ${numBatches}.
    Asegúrate de cubrir diferentes secciones del documento en cada lote si es posible, o enfócate en detalles profundos.
    
    Cada pregunta debe tener 4 opciones (una correcta), y una explicación detallada que haga referencia al contenido del documento.
    Responde únicamente con el formato JSON especificado en el schema.
    `;

    try {
        // Parallel Execution
        const promises = Array.from({ length: numBatches }).map(async (_, i) => {
            const batchResult = await generateQuestionBatch(getPrompt(i), pdfPart);
             
             completedBatches++;
             const simulatedLoaded = Math.min(completedBatches * batchSize, totalQuestions);
             onProgress(simulatedLoaded, totalQuestions);

             if (batchResult.length === 0) {
                 console.warn(`Batch ${i+1} for PDF simulation returned 0 questions.`);
            }
            return batchResult;
        });

        const results = await Promise.all(promises);
        const allQuestions = results.flat();

        if (allQuestions.length < totalQuestions * 0.5) {
            throw new Error(`Failed to generate enough PDF simulation questions. Got ${allQuestions.length}`);
        }

        return { questions: allQuestions.slice(0, totalQuestions) };
    } catch (error) {
        console.error("Error generating PDF simulation exam:", error);
        return null;
    }
};


export const generateHint = async (question: string, options: string[]): Promise<string> => {
    const prompt = `
    Actúa como un tutor experto y amigable. Un estudiante está atascado en la siguiente pregunta de opción múltiple. Tu tarea es proporcionar una pista sutil e inteligente que lo guíe hacia la respuesta correcta SIN revelar la respuesta directamente.

    La pista debe hacer que el estudiante piense en el concepto clave necesario para resolver el problema. Puedes hacer una pregunta retórica o recordarle una fórmula o un principio relevante.

    Pregunta: "${question}"
    Opciones:
    ${options.map((opt, i) => `${i + 1}. ${opt}`).join('\n')}

    Genera solo la pista. Sé breve y directo.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                temperature: 0.8,
            },
        });
        return response.text;
    } catch (error) {
        console.error("Error generating hint:", error);
        return "No se pudo generar una pista en este momento. Intenta resolverlo por tu cuenta.";
    }
};

export const startChatSession = (lessonContent: string): Chat => {
    const chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        history: [
            {
                role: 'user',
                parts: [{ text: `CONTEXTO DE LA LECCIÓN:\n\n---\n\n${lessonContent}\n\n---` }],
            },
            {
                role: 'model',
                parts: [{ text: '¡Entendido! He asimilado el contenido de la lección. Estoy listo para responder tus preguntas sobre este tema específico.' }],
            },
        ],
        config: {
            systemInstruction: `
            Eres un tutor virtual experto y amigable llamado Prep-AI. Tu función es ayudar al estudiante a dominar el contexto de la lección proporcionada.

            **TUS CAPACIDADES:**
            1. **Responder Preguntas:** Aclara dudas basándote estrictamente en la lección.
            2. **Generar Ejercicios Interactivos (IMPORTANTE):** 
               - Si el estudiante pide "ejercicios", "practicar", "más problemas" o similar, DEBES generar UN (1) ejercicio práctico o pregunta de repaso relacionada con el tema actual.
               - PRESENTA el problema y espera a que el estudiante responda. NO des la solución inmediatamente.
               - Una vez el estudiante envíe su respuesta, evalúala, di si es correcta o incorrecta, y explica la solución paso a paso.
               - Luego, pregunta si quiere otro ejercicio.

            **ESTILO DE RESPUESTA:**
            - Sé claro, conciso y didáctico.
            - Usa párrafos cortos y listas con viñetas (*).
            - Resalta conceptos clave con negritas (**concepto**).
            - Si usas matemáticas, usa formato LaTeX ($x^2$).
            - Si la pregunta no tiene que ver con la lección, redirige amablemente al estudiante.
            `,
            temperature: 0.7,
        },
    });
    return chat;
};

// Shared Schema for Study Plans
const planSchema = {
    type: Type.OBJECT,
    properties: {
        university: { type: Type.STRING },
        weeks: { type: Type.INTEGER },
        hoursPerWeek: { type: Type.INTEGER },
        plan: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    day: { type: Type.INTEGER },
                    week: { type: Type.INTEGER },
                    subTopic: { type: Type.STRING },
                    topic: { type: Type.STRING },
                    status: { type: Type.STRING }
                },
                required: ["day", "week", "subTopic", "topic", "status"]
            }
        }
    },
    required: ["university", "weeks", "hoursPerWeek", "plan"]
};

export const generateStudyPlan = async (university: string, weeks: number, hoursPerWeek: number, syllabus: Subject): Promise<StudyPlan> => {
    const syllabusText = syllabus.topics.map(topic => 
        `  - ${topic.name}:\n${topic.subTopics.map(sub => `    - ${sub.name}`).join('\n')}`
    ).join('\n');

    const prompt = `
    Actúa como un planificador académico experto. Un estudiante necesita un plan de estudio personalizado para prepararse para el examen de admisión de "${university}".
    
    Parámetros del estudiante:
    - Semanas disponibles: ${weeks}
    - Horas de estudio por semana: ${hoursPerWeek}
    
    Temario completo:
    \`\`\`
    ${syllabusText}
    \`\`\`

    Tarea:
    Crea un plan de estudio detallado, día por día. Distribuye todos los subtemas del temario de manera equilibrada a lo largo de las semanas. Asume que el estudiante estudia 5 días a la semana. Calcula cuántos subtemas debe estudiar por día para cubrir todo el material.
    
    Responde ÚNICAMENTE con un objeto JSON que siga la estructura del schema proporcionado. No incluyas ningún otro texto o explicación.
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: planSchema
        }
    });

    return JSON.parse(response.text);
};

export const generateStudyPlanFromPDF = async (pdfBase64: string, weeks: number, hoursPerWeek: number): Promise<StudyPlan> => {
    const prompt = `
    Actúa como un experto diseñador curricular de élite. Tienes acceso a un documento PDF que contiene el temario oficial de un examen de admisión universitaria.
    
    **TUS OBJETIVOS:**
    1. **Analizar el PDF:** Extrae la universidad, la materia y todos los temas y subtemas listados en el documento.
    2. **Crear un Plan de Estudio:** Genera un calendario detallado de estudio de ${weeks} semanas, asumiendo una carga de ${hoursPerWeek} horas semanales (estudio 5 días a la semana).
    3. **Calidad:** Asegúrate de que la progresión sea lógica (de lo básico a lo avanzado) y cubra TODO el contenido del PDF.
    
    **SALIDA:**
    Responde ÚNICAMENTE con un objeto JSON que siga exactamente el esquema proporcionado. 
    Si el PDF no menciona explícitamente el nombre de la universidad, usa "Universidad del PDF" o infiérelo del contexto.
    `;

    const pdfPart = {
        inlineData: {
            mimeType: 'application/pdf',
            data: pdfBase64
        }
    };

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
            parts: [pdfPart, { text: prompt }]
        },
        config: {
            responseMimeType: 'application/json',
            responseSchema: planSchema
        }
    });

    return JSON.parse(response.text);
};


export const generateFlashcards = async (subTopic: string): Promise<Flashcard[]> => {
    const prompt = `
    Actúa como un experto en técnicas de memorización. Genera un set de 10-15 flashcards (tarjetas de estudio) para el siguiente subtema: "${subTopic}".
    Cada flashcard debe tener un "term" (término, concepto o pregunta clave) y una "definition" (definición o respuesta concisa y clara).
    Enfócate en los conceptos más importantes que un estudiante debería memorizar.
    
    Responde ÚNICAMENTE con un objeto JSON que siga la estructura del schema proporcionado (un objeto con una clave "flashcards" que contiene un array de objetos).
    `;

    const flashcardSchema = {
        type: Type.OBJECT,
        properties: {
            flashcards: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        term: { type: Type.STRING },
                        definition: { type: Type.STRING }
                    },
                    required: ["term", "definition"]
                }
            }
        },
        required: ["flashcards"]
    };

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: flashcardSchema
        }
    });

    const data = JSON.parse(response.text);
    return data.flashcards;
};

export const explainSimpler = async (textToSimplify: string): Promise<string> => {
    const prompt = `
    Actúa como un tutor experto en simplificar conceptos complejos. Toma el siguiente texto y explícalo de una manera mucho más simple, como si se lo estuvieras explicando a un amigo. Usa analogías y ejemplos cotidianos. Mantén la precisión pero elimina la jerga técnica.
    
    Texto a simplificar:
    "${textToSimplify}"
    
    Responde únicamente con la explicación simplificada.
    `;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    return response.text;
};

interface Mistake {
    question: string;
    userAnswer: string;
    correctAnswer: string;
    explanation: string;
}

export const analyzeMistakes = async (mistakes: Mistake[]): Promise<string> => {
    const prompt = `
    Actúa como un tutor universitario experto, empático y perspicaz. Un estudiante acaba de terminar un examen y ha cometido los siguientes errores. Tu tarea es analizar estos errores para identificar patrones y conceptos subyacentes que no comprende bien. Luego, proporciona un resumen constructivo y accionable.

    **ERRORES DEL ESTUDIANTE:**
    ${mistakes.map((m, i) => `
    ---
    **Error #${i + 1}**
    **Pregunta:** ${m.question}
    **Respuesta del estudiante:** ${m.userAnswer}
    **Respuesta correcta:** ${m.correctAnswer}
    **Explicación:** ${m.explanation}
    ---
    `).join('\n')}

    **INSTRUCCIONES PARA TU ANÁLISIS:**
    1.  **No te limites a repetir las explicaciones.** Busca el "porqué" detrás de los errores. ¿Hay un patrón? ¿Confunde términos similares? ¿Tiene problemas con un tipo específico de cálculo? ¿Falla en la comprensión lectora?
    2.  **Sé constructivo y alentador.** Empieza con una frase positiva. Evita un lenguaje que pueda desmotivar al estudiante. En lugar de decir "Te equivocaste en todo lo relacionado con X", di algo como "Parece que el área donde más podemos reforzar es en X. ¡Es un concepto clave y con un poco de práctica lo dominarás!".
    3.  **Proporciona 2-3 puntos clave y accionables.** Resume tus hallazgos en una lista corta y fácil de digerir. Cada punto debe ser una recomendación clara.
    4.  **Mantén el análisis conciso.** El objetivo es dar una guía rápida y de alto impacto, no un informe exhaustivo.
    5.  **Usa formato Markdown.** Utiliza negritas (\`**\`) para resaltar conceptos clave y listas con asteriscos (\`* \`) para tus recomendaciones.

    Genera únicamente el análisis.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                temperature: 0.7,
            },
        });
        return response.text;
    } catch (error) {
        console.error("Error analyzing mistakes:", error);
        return "No se pudo generar el análisis de errores en este momento. Revisa las explicaciones de cada pregunta para entender tus fallos.";
    }
};

// --- Image Solver Logic ---

export interface SolutionResponse {
    textExplanation: string;
    audioScript: string;
}

export const analyzeImageForSolution = async (base64Image: string): Promise<SolutionResponse> => {
    const prompt = `
    Actúa como el mejor tutor privado del mundo. El estudiante te ha enviado una imagen de un problema académico, un texto, un diagrama o una pregunta.
    
    **TU OBJETIVO:**
    1.  **Analizar:** Entiende profundamente qué hay en la imagen.
    2.  **Explicación Escrita (Detallada):** Proporciona una solución paso a paso, clara y formateada en Markdown.
        - Si es matemáticas, usa LaTeX (ej. $x^2$).
        - Si es texto, resume y explica.
        - Si es un diagrama, descríbelo y explica su función.
    3.  **Guion de Audio (Natural):** Escribe un párrafo CONVERSACIONAL y AMIGABLE que explique la solución como si le estuvieras hablando al estudiante.
        - NO leas fórmulas complejas símbolo por símbolo. Describe el concepto (ej: "Usamos la fórmula cuadrática para encontrar x...").
        - Sé fluido, alentador y natural.
    
    **SCHEMA:**
    Responde ÚNICAMENTE con un JSON que contenga:
    - "textExplanation": (string con Markdown)
    - "audioScript": (string texto plano para ser leído en voz alta)
    `;

    const imagePart = {
        inlineData: {
            mimeType: 'image/jpeg', // Assuming JPEG for simplicity, user uploads mostly are
            data: base64Image
        }
    };

    const schema = {
        type: Type.OBJECT,
        properties: {
            textExplanation: { type: Type.STRING },
            audioScript: { type: Type.STRING }
        },
        required: ["textExplanation", "audioScript"]
    };

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
            parts: [imagePart, { text: prompt }]
        },
        config: {
            responseMimeType: 'application/json',
            responseSchema: schema
        }
    });
    
    return JSON.parse(response.text);
};

export const generateAudioFromText = async (textToSpeak: string): Promise<string | null> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: textToSpeak }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Kore' }, // Voices: 'Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr'
                    },
                },
            },
        });
        
        // The response structure for audio modality
        return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null;
    } catch (error) {
        console.error("Error generating audio:", error);
        return null;
    }
};
