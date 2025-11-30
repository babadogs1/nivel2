
import React, { useState, useEffect, useRef } from 'react';
import { Chat } from '@google/genai';
import { startChatSession, explainSimpler } from '../services/geminiService';
import type { ChatMessage } from '../types';
import InlineContent from './InlineContent';

interface ChatComponentProps {
  lessonContent: string;
}

const ChatComponent: React.FC<ChatComponentProps> = ({ lessonContent }) => {
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSimplifying, setIsSimplifying] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const chatSession = startChatSession(lessonContent);
    setChat(chatSession);
    setMessages([
      {
        role: 'model',
        content: '¡Hola! Soy tu tutor de IA. He leído la lección. ¿Tienes alguna pregunta o hay algo que no quedó claro?'
      }
    ]);
  }, [lessonContent]);

  useEffect(() => {
    // Scroll to the bottom
    messagesContainerRef.current?.lastElementChild?.scrollIntoView({ behavior: 'smooth' });
    
    // Run MathJax on the container after messages update
    if (messagesContainerRef.current && typeof (window as any).MathJax?.typesetPromise === 'function') {
        (window as any).MathJax.typesetPromise([messagesContainerRef.current]).catch((err: any) => console.error('MathJax typeset error in chat:', err));
    }
  }, [messages, isLoading, isSimplifying]);

  const processMessage = async (text: string) => {
    if (!text.trim() || !chat || isLoading || isSimplifying) return;

    const newUserMessage: ChatMessage = { role: 'user', content: text };
    setMessages(prev => [...prev, newUserMessage]);
    setUserInput('');
    setIsLoading(true);

    try {
      const stream = await chat.sendMessageStream({ message: text });
      
      let modelResponse = '';
      setMessages(prev => [...prev, { role: 'model', content: '' }]);

      for await (const chunk of stream) {
        modelResponse += chunk.text;
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1].content = modelResponse;
          return newMessages;
        });
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { role: 'model', content: 'Lo siento, he encontrado un error. Por favor, intenta de nuevo.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    processMessage(userInput);
  };

  const handleExplainSimpler = async () => {
    const lastModelMessage = [...messages].reverse().find(m => m.role === 'model');
    if (!lastModelMessage || !lastModelMessage.content || isLoading || isSimplifying) return;
    
    setIsSimplifying(true);
    try {
        const simplifiedText = await explainSimpler(lastModelMessage.content);
        setMessages(prev => [...prev, {role: 'model', content: `**En términos más sencillos:**\n\n${simplifiedText}`}]);
    } catch (error) {
        console.error("Error simplifying text:", error);
        setMessages(prev => [...prev, { role: 'model', content: 'Lo siento, no pude simplificar esa explicación en este momento.' }]);
    } finally {
        setIsSimplifying(false);
    }
  };

  const handleGenerateExercise = () => {
     processMessage("Por favor, dame un ejercicio práctico sobre este tema para resolverlo aquí. No me des la respuesta todavía.");
  };

  const lastMessageWasFromModel = messages.length > 0 && messages[messages.length - 1].role === 'model' && !isLoading;

  return (
    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 shadow-inner border border-gray-200 dark:border-gray-700">
      <h3 className="text-xl font-bold text-center mb-4 text-gray-800 dark:text-gray-200">¿Tienes alguna duda?</h3>
      <div ref={messagesContainerRef} className="h-80 overflow-y-auto pr-4 space-y-4 mb-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-2xl whitespace-pre-line ${msg.role === 'user'
                ? 'bg-blue-600 text-white rounded-br-none'
                : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none shadow-sm'
              }`}>
              <InlineContent text={msg.content} />
            </div>
          </div>
        ))}
        {(isLoading || isSimplifying) && (
          <div className="flex justify-start">
            <div className="max-w-xs md:max-w-md lg:max-w-lg px-4 py-3 rounded-2xl bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none shadow-sm flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce mr-2"></span>
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce mr-2 [animation-delay:0.2s]"></span>
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
            </div>
          </div>
        )}
      </div>
       <div className="flex flex-col space-y-3">
            <form onSubmit={handleSendMessage} className="flex-grow flex items-center space-x-2">
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Escribe tu pregunta aquí..."
                  className="flex-grow p-3 rounded-full border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white text-gray-900 dark:bg-gray-700 dark:text-white transition-shadow"
                  disabled={isLoading || isSimplifying}
                />
                <button
                  type="submit"
                  disabled={isLoading || isSimplifying || !userInput.trim()}
                  className="bg-blue-600 text-white rounded-full p-3 hover:bg-blue-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors flex-shrink-0"
                  aria-label="Enviar mensaje"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                </button>
            </form>
            
            <div className="flex space-x-2 overflow-x-auto pb-1">
                 <button
                    onClick={handleExplainSimpler}
                    disabled={!lastMessageWasFromModel || isSimplifying}
                    className="flex-shrink-0 bg-purple-600 text-white rounded-full px-4 py-2 hover:bg-purple-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors flex items-center text-sm font-medium shadow-sm"
                    title="Explícamelo Fácil"
                 >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 7a1 1 0 100 2h6a1 1 0 100-2H7zM7 11a1 1 0 100 2h2a1 1 0 100-2H7z" clipRule="evenodd" />
                    </svg>
                    Explícamelo fácil
                 </button>

                 <button
                    onClick={handleGenerateExercise}
                    disabled={isLoading || isSimplifying}
                    className="flex-shrink-0 bg-green-600 text-white rounded-full px-4 py-2 hover:bg-green-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors flex items-center text-sm font-medium shadow-sm"
                    title="Generar ejercicio práctico"
                 >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                    Practicar
                 </button>
            </div>
       </div>
    </div>
  );
};

export default ChatComponent;
