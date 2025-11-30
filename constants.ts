import type { Subject } from './types';

export const SYLLABUS: Subject[] = [
  {
    name: 'Examen de Admisión - USFQ',
    topics: [
      {
        name: 'Aptitud Verbal (PAA)',
        subTopics: [
          { name: 'Análisis de Información Explícita' },
          { name: 'Análisis de Información Implícita (Inferencial)' },
          { name: 'Identificar la idea central y los argumentos secundarios' },
          { name: 'Propósito y perspectiva del autor' },
          { name: 'Vocabulario en Contexto' },
          { name: 'Análisis Estructural: relación entre párrafos' },
          { name: 'Análisis del Tono: informativo, persuasivo, irónico' },
          { name: 'Síntesis y resúmenes precisos' },
          { name: 'Análisis de lenguaje figurado (metáforas, símiles)' },
          { name: 'Comparar y contrastar información entre textos' },
          { name: 'Análisis de tablas, gráficos e infografías' },
          { name: 'Identificación de falacias argumentativas' },
          { name: 'Coherencia y Cohesión en párrafos' },
          { name: 'Uso de conectores lógicos y transiciones' },
          { name: 'Concordancia nominal y verbal' },
          { name: 'Construcción de oraciones: claridad y precisión' },
          { name: 'Eliminación de redundancia y ambigüedad' },
          { name: 'Selección del vocabulario más preciso' },
          { name: 'Uso correcto de la puntuación' },
          { name: 'Reglas de ortografía y acentuación' },
        ],
      },
      {
        name: 'Aptitud Matemática (PAA)',
        subTopics: [
          { name: 'Propiedades y operaciones de los números reales' },
          { name: 'Potenciación y radicación' },
          { name: 'Jerarquía de operaciones y signos de agrupación' },
          { name: 'Razones, proporciones y porcentajes' },
          { name: 'Regla de tres simple y compuesta' },
          { name: 'Mínimo común múltiplo y máximo común divisor' },
          { name: 'Teoría de Números: primos, compuestos y divisibilidad' },
          { name: 'Notación científica y operaciones' },
          { name: 'Expresiones Algebraicas: simplificación y factorización' },
          { name: 'Productos notables y cocientes notables' },
          { name: 'Ecuaciones lineales, fraccionarias y cuadráticas' },
          { name: 'Sistemas de ecuaciones lineales con dos y tres variables' },
          { name: 'Desigualdades lineales y con valor absoluto' },
          { name: 'Funciones: definición, dominio, rango y gráficas' },
          { name: 'Análisis de funciones crecientes y decrecientes' },
          { name: 'Funciones cuadráticas, exponenciales y logarítmicas' },
          { name: 'Propiedades de exponentes y logaritmos' },
          { name: 'Figuras Planas: propiedades de ángulos, rectas y polígonos' },
          { name: 'Cálculo de perímetros y áreas de figuras planas' },
          { name: 'Propiedades de la circunferencia y el círculo' },
          { name: 'Teorema de Pitágoras y triángulos notables' },
          { name: 'Semejanza y congruencia de triángulos' },
          { name: 'Sólidos: cálculo de volumen y área de superficie' },
          { name: 'Geometría Analítica: plano cartesiano y propiedades de la recta' },
          { name: 'Trigonometría básica: seno, coseno y tangente' },
          { name: 'Interpretación de datos en tablas y gráficos' },
          { name: 'Medidas de tendencia central: media, mediana y moda' },
          { name: 'Medidas de dispersión: rango y desviación estándar (concepto)' },
          { name: 'Técnicas de conteo: principio de multiplicación y adición' },
          { name: 'Permutaciones y combinaciones' },
          { name: 'Conceptos básicos de probabilidad de eventos simples' },
          { name: 'Probabilidad de eventos compuestos (unión e intersección)' },
          { name: 'Diagramas de Venn y tablas de contingencia' },
        ],
      },
      {
        name: 'Conocimientos de Ciencias (Salud)',
        subTopics: [
          { name: 'Biología: Química de la Vida, Bioelementos y Biomoléculas' },
          { name: 'Biología: La Célula, Organelos y Transporte Celular' },
          { name: 'Biología: Metabolismo Celular, Fotosíntesis y Respiración' },
          { name: 'Biología: Ciclo Celular, Mitosis y Meiosis' },
          { name: 'Biología: Genética Mendeliana y Herencia' },
          { name: 'Biología: Dogma Central de la Biología Molecular' },
          { name: 'Biología: Evolución y Selección Natural' },
          { name: 'Química: Estructura Atómica y Tabla Periódica' },
          { name: 'Química: Enlaces Químicos y Nomenclatura Inorgánica' },
          { name: 'Química: Estequiometría, Mol y Balanceo de Ecuaciones' },
          { name: 'Química: Disoluciones y Unidades de Concentración' },
          { name: 'Química: Leyes de los Gases Ideales' },
          { name: 'Química: Nomenclatura de Química Orgánica Básica' },
          { name: 'Matemáticas (Ciencias): Funciones Avanzadas y Análisis' },
          { name: 'Matemáticas (Ciencias): Trigonometría y Círculo Unitario' },
        ],
      },
    ],
  },
  {
    name: 'Prueba de Admisión - Pontificia Universidad Católica del Ecuador (PUCE)',
    topics: [
      {
        name: 'Razonamiento Verbal',
        subTopics: [
          { name: 'Sinónimos y Antónimos' },
          { name: 'Analogías Verbales' },
          { name: 'Comprensión Lectora: Idea Principal y Secundaria' },
          { name: 'Término Excluido' },
          { name: 'Oraciones Incompletas y Conectores Lógicos' },
          { name: 'Plan de Redacción' },
          { name: 'Interpretación de Refranes y Proverbios' },
        ],
      },
      {
        name: 'Razonamiento Numérico',
        subTopics: [
          { name: 'Operaciones Fundamentales y Problemas' },
          { name: 'Sucesiones Numéricas y Alfanuméricas' },
          { name: 'Fracciones y Porcentajes' },
          { name: 'Resolución de Ecuaciones Simples' },
          { name: 'Análisis y Suficiencia de Datos' },
          { name: 'Problemas de Lógica Matemática' },
          { name: 'Interpretación de Gráficos Estadísticos' },
        ],
      },
      {
        name: 'Razonamiento Abstracto',
        subTopics: [
          { name: 'Series Gráficas' },
          { name: 'Analogías Gráficas' },
          { name: 'Matrices Gráficas' },
          { name: 'Figuras que no corresponden con el grupo' },
          { name: 'Visualización Espacial y Rotación de Figuras' },
          { name: 'Conteo de Figuras y Regiones' },
        ],
      },
      {
        name: 'Dominio Lingüístico',
        subTopics: [
            { name: 'Reglas de Tildación' },
            { name: 'Uso de mayúsculas y minúsculas' },
            { name: 'Signos de Puntuación' },
            { name: 'Cohesión y Coherencia Textual' },
            { name: 'Uso correcto de preposiciones y conjunciones' },
        ]
      }
    ],
  },
  {
    name: 'Prueba de Admisión - Universidad de Las Américas (UDLA)',
    topics: [
      {
        name: 'Aptitud Verbal y Comprensión Lectora',
        subTopics: [
          { name: 'Comprensión de Textos Académicos y Científicos' },
          { name: 'Análisis Crítico del Discurso' },
          { name: 'Vocabulario Académico Avanzado' },
          { name: 'Identificación de Tesis y Argumentos' },
          { name: 'Inferencia a partir de Información Compleja' },
          { name: 'Relación entre fragmentos de un texto' },
        ],
      },
      {
        name: 'Aptitud Cuantitativa (Matemáticas)',
        subTopics: [
          { name: 'Resolución de Problemas con Álgebra' },
          { name: 'Funciones y Modelos Matemáticos' },
          { name: 'Geometría Analítica y Espacial' },
          { name: 'Probabilidad y Estadística Aplicada' },
          { name: 'Análisis de Suficiencia de Datos' },
          { name: 'Interpretación de Modelos Matemáticos' },
        ],
      },
      {
        name: 'Redacción y Ortografía',
        subTopics: [
          { name: 'Estructura del Ensayo Argumentativo' },
          { name: 'Normas de Citación y Referencias (básico)' },
          { name: 'Claridad, Concisión y Precisión en la Escritura' },
          { name: 'Errores Comunes en la Sintaxis' },
          { name: 'Uso avanzado de la puntuación' },
        ],
      },
      {
        name: 'Razonamiento Lógico',
        subTopics: [
            { name: 'Lógica Proposicional y Silogismos' },
            { name: 'Resolución de Problemas con Restricciones' },
            { name: 'Análisis de Secuencias y Patrones Complejos' },
            { name: 'Inferencia Lógica a partir de Reglas' },
            { name: 'Diagramas de Flujo y Algoritmos Simples' },
        ]
      }
    ]
  },
  {
    name: 'Prueba de Admisión - Universidades Públicas (SENESCYT)',
    topics: [
      {
        name: 'Razonamiento Numérico',
        subTopics: [
            { name: 'Operaciones con números reales' },
            { name: 'Potenciación y radicación' },
            { name: 'Fracciones, decimales y porcentajes' },
            { name: 'Proporcionalidad directa e inversa' },
            { name: 'Resolución de ecuaciones de primer grado' },
            { name: 'Sistemas de ecuaciones lineales' },
            { name: 'Sucesiones y series numéricas' },
            { name: 'Análisis de datos estadísticos (media, moda, mediana)' },
            { name: 'Resolución de problemas de lógica matemática' },
        ]
      },
      {
        name: 'Razonamiento Verbal',
        subTopics: [
            { name: 'Comprensión de lectura crítica y analítica' },
            { name: 'Identificación de la idea principal y secundaria' },
            { name: 'Sinónimos y antónimos contextuales' },
            { name: 'Analogías verbales' },
            { name: 'Completar oraciones con conectores lógicos' },
            { name: 'Ordenamiento de oraciones y párrafos (plan de redacción)' },
            { name: 'Precisión semántica y vocabulario' },
        ]
      },
      {
        name: 'Razonamiento Abstracto',
        subTopics: [
            { name: 'Identificación de patrones en series gráficas' },
            { name: 'Analogías entre figuras' },
            { name: 'Completar matrices gráficas' },
            { name: 'Identificación de la figura que no corresponde' },
            { name: 'Razonamiento espacial: rotación y vistas de sólidos' },
            { name: 'Problemas de conteo de figuras' },
        ]
      },
      {
        name: 'Dominio Científico-Natural',
        subTopics: [
            { name: 'Biología: La célula, tejidos y sistemas del cuerpo humano' },
            { name: 'Biología: Principios de genética y herencia' },
            { name: 'Biología: Ecosistemas y cadenas tróficas' },
            { name: 'Química: La materia, estructura atómica y tabla periódica' },
            { name: 'Química: Enlaces químicos y compuestos inorgánicos' },
            { name: 'Química: Reacciones químicas y estequiometría básica' },
            { name: 'Física: Cinemática (MRU, MRUV)' },
            { name: 'Física: Leyes de Newton y dinámica' },
            { name: 'Física: Energía, trabajo y potencia' },
        ]
      },
      {
        name: 'Dominio Social',
        subTopics: [
            { name: 'Historia del Ecuador: Época aborigen, colonial y republicana' },
            { name: 'Historia Universal: Hitos principales' },
            { name: 'Geografía del Ecuador: Regiones y recursos' },
            { name: 'Educación para la Ciudadanía: Derechos y deberes' },
            { name: 'Estructura del Estado Ecuatoriano' },
        ]
      }
    ]
  }
];