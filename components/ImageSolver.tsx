
import React, { useState, useRef } from 'react';
import { analyzeImageForSolution, generateAudioFromText } from '../services/geminiService';
import InlineContent from './InlineContent';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';

// Helper to decode base64 to bytes
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Helper to decode PCM data from Gemini API
async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number = 24000,
  numChannels: number = 1,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

interface ImageSolverProps {
    onBack: () => void;
}

const ImageSolver: React.FC<ImageSolverProps> = ({ onBack }) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState<string>('');
  const [error, setError] = useState('');
  
  // Audio State
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      // Reset states
      setExplanation(null);
      setAudioBuffer(null);
      setError('');
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleAnalyze = async () => {
    if (!imageFile) return;

    setIsLoading(true);
    setError('');
    setExplanation(null);
    setAudioBuffer(null);

    try {
      // 1. Analyze Image (Vision)
      setLoadingStage('Analizando imagen y resolviendo...');
      const base64 = await fileToBase64(imageFile);
      const solution = await analyzeImageForSolution(base64);
      
      setExplanation(solution.textExplanation);

      // 2. Generate Audio (TTS)
      setLoadingStage('Generando explicación de voz...');
      const audioBase64 = await generateAudioFromText(solution.audioScript);
      
      if (audioBase64) {
        // 3. Decode Audio
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        audioContextRef.current = audioCtx;
        
        const pcmBytes = decode(audioBase64);
        const buffer = await decodeAudioData(pcmBytes, audioCtx);
        setAudioBuffer(buffer);
      }

    } catch (err) {
      console.error(err);
      setError('Hubo un problema al procesar la imagen. Intenta nuevamente.');
    } finally {
      setIsLoading(false);
      setLoadingStage('');
    }
  };

  const toggleAudio = () => {
    if (!audioBuffer || !audioContextRef.current) return;

    if (isPlaying) {
      // Stop
      if (sourceNodeRef.current) {
        sourceNodeRef.current.stop();
        sourceNodeRef.current = null;
      }
      setIsPlaying(false);
    } else {
      // Play
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);
      source.onended = () => setIsPlaying(false);
      source.start();
      sourceNodeRef.current = source;
      setIsPlaying(true);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 md:p-8 max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
         <button
          onClick={onBack}
          className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-bold py-2 px-4 rounded-lg transition-colors inline-flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          Volver
        </button>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-200">
           Resolver con Foto
        </h2>
      </div>

      {!explanation && !isLoading && (
          <div className="mb-8 p-8 border-4 border-dashed border-blue-200 dark:border-gray-600 rounded-xl bg-blue-50 dark:bg-gray-700/30 text-center transition-colors hover:bg-blue-100 dark:hover:bg-gray-700/50">
            <input
                type="file"
                accept="image/*"
                capture="environment" // Opens camera on mobile
                onChange={handleFileChange}
                className="hidden"
                id="cameraInput"
            />
            <label htmlFor="cameraInput" className="cursor-pointer flex flex-col items-center justify-center h-full w-full">
                {previewUrl ? (
                    <img src={previewUrl} alt="Preview" className="max-h-64 rounded-lg shadow-md object-contain" />
                ) : (
                    <>
                         <div className="bg-blue-100 dark:bg-blue-900 p-4 rounded-full mb-4">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-600 dark:text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                         </div>
                        <span className="text-lg font-semibold text-gray-700 dark:text-gray-300">Toca aquí para tomar una foto o subir imagen</span>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Resolvemos matemáticas, explicamos diagramas o resumimos textos.</p>
                    </>
                )}
            </label>
          </div>
      )}

      {/* Actions */}
      {!explanation && !isLoading && previewUrl && (
          <button
            onClick={handleAnalyze}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg transform transition-transform hover:scale-[1.02] flex justify-center items-center text-xl"
          >
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Analizar y Explicar
          </button>
      )}

      {isLoading && (
          <div className="py-12">
             <LoadingSpinner messages={[loadingStage || "Procesando..."]} />
          </div>
      )}

      {error && <ErrorMessage message={error} />}

      {explanation && (
        <div className="animate-fade-in">
            <div className="flex flex-col md:flex-row gap-6 mb-6">
                <div className="md:w-1/3">
                     <img src={previewUrl!} alt="Source" className="w-full rounded-lg shadow-md border border-gray-200 dark:border-gray-700" />
                </div>
                <div className="md:w-2/3">
                    {audioBuffer ? (
                        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-6 text-white shadow-lg mb-4 flex items-center justify-between">
                            <div>
                                <h3 className="font-bold text-lg">Explicación de Audio</h3>
                                <p className="text-purple-100 text-sm">Escucha la solución paso a paso</p>
                            </div>
                            <button
                                onClick={toggleAudio}
                                className="bg-white text-purple-700 p-4 rounded-full shadow-md hover:bg-gray-100 transition-colors focus:outline-none focus:ring-4 focus:ring-purple-300"
                            >
                                {isPlaying ? (
                                     <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 pl-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    ) : (
                        <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg mb-4 text-center text-gray-500">
                            No se pudo generar el audio.
                        </div>
                    )}
                    
                    <div className="prose dark:prose-invert max-w-none bg-gray-50 dark:bg-gray-900/50 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                         <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4 border-b pb-2 border-gray-300 dark:border-gray-600">Solución Detallada</h3>
                         <InlineContent text={explanation} />
                    </div>
                </div>
            </div>
            
            <div className="text-center mt-8">
                 <button
                    onClick={() => {
                        setExplanation(null);
                        setAudioBuffer(null);
                        setImageFile(null);
                        setPreviewUrl(null);
                    }}
                    className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-8 rounded-lg transition-colors"
                  >
                    Resolver Otro Problema
                  </button>
            </div>
        </div>
      )}
    </div>
  );
};

export default ImageSolver;
