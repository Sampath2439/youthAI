import React, { useState, useEffect, useRef } from 'react';
import { Chat } from '@google/genai';
import { ChatMessage } from '../types';
import { startChatSession, generateIntroVideo } from '../services/geminiService';
import { addWellnessDataPoint } from '../services/historyService';
import { buildSystemInstruction } from '../services/contextService';
import { UserCircleIcon, SparklesIcon, PlayCircleIcon } from './IconComponents';

interface VideoModalProps {
  videoUrl: string;
  onClose: () => void;
}

const VideoModal: React.FC<VideoModalProps> = ({ videoUrl, onClose }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const fullVideoUrl = `${videoUrl}&key=${process.env.API_KEY}`;

    const handleClose = () => {
        if (videoRef.current) {
            videoRef.current.pause();
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={handleClose}>
            <div className="bg-slate-800 rounded-2xl shadow-xl max-w-3xl w-full border border-slate-700" onClick={e => e.stopPropagation()}>
                <div className="p-2 flex justify-end">
                    <button onClick={handleClose} className="text-slate-400 hover:text-white text-3xl font-bold">&times;</button>
                </div>
                <div className="aspect-video w-full p-2 pt-0">
                    <video ref={videoRef} className="w-full h-full rounded-lg" src={fullVideoUrl} controls autoPlay>
                        Your browser does not support the video tag.
                    </video>
                </div>
            </div>
        </div>
    );
};

export const CoachPage: React.FC = () => {
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [videoGenerationMessage, setVideoGenerationMessage] = useState('');
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initializeChat = () => {
        const instruction = buildSystemInstruction();
        const chat = startChatSession(instruction);
        setChatSession(chat);
        setIsInitializing(false);
    };
    initializeChat();
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);
  
  useEffect(() => {
    let interval: number | undefined;
    if (isGeneratingVideo) {
        const messages = [
            "Warming up the AI video generator...",
            "Crafting the perfect introduction...",
            "Rendering pixels and sound...",
            "This can take a minute or two...",
            "Almost there, thanks for your patience!",
        ];
        let messageIndex = 0;
        setVideoGenerationMessage(messages[messageIndex]);
        interval = window.setInterval(() => {
            messageIndex = (messageIndex + 1) % messages.length;
            setVideoGenerationMessage(messages[messageIndex]);
        }, 4000);
    }
    return () => clearInterval(interval);
  }, [isGeneratingVideo]);

  const handleGenerateVideo = async () => {
      setIsGeneratingVideo(true);
      setError(null);
      try {
          const url = await generateIntroVideo();
          setVideoUrl(url);
          setShowVideoModal(true);
      } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to generate video.');
      } finally {
          setIsGeneratingVideo(false);
      }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || !chatSession || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', text: userInput };
    setMessages(prev => [...prev, userMessage]);
    setUserInput('');
    setIsLoading(true);
    setError(null);
    
    try {
        const stream = await chatSession.sendMessageStream({ message: userInput });
        
        let modelResponse = '';
        setMessages(prev => [...prev, { role: 'model', text: '...' }]);

        for await (const chunk of stream) {
            modelResponse += chunk.text;
            setMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1].text = modelResponse + '...';
                return newMessages;
            });
        }
        
        setMessages(prev => {
            const newMessages = [...prev];
            newMessages[newMessages.length - 1].text = modelResponse;
            return newMessages;
        });
        
        // Log interaction as a positive wellness event
        addWellnessDataPoint(75, 'coach');

    } catch (err) {
        setError("Sorry, I couldn't get a response. Please try again.");
        console.error(err);
    } finally {
        setIsLoading(false);
    }
  };

  if (isInitializing) {
    return (
      <div className="flex flex-col justify-center items-center h-full text-center">
          <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        <p className="mt-3 text-lg text-slate-600 dark:text-slate-400 font-semibold">Personalizing your AI Therapist...</p>
        <p className="text-sm text-slate-500 dark:text-slate-500 max-w-sm">Loading your recent emotional state, diet logs, and goals to provide a more relevant and supportive conversation.</p>
      </div>
    );
  }

  return (
    <>
      {showVideoModal && videoUrl && <VideoModal videoUrl={videoUrl} onClose={() => setShowVideoModal(false)} />}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-slate-800 dark:text-slate-100 mb-4">AI Therapist & Friend</h2>

          <div className="text-center mb-6 p-4 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-slate-700 shadow-md">
              <h3 className="font-semibold text-slate-700 dark:text-slate-200">New to the AI Therapist?</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">Your AI companion, now with insights from your wellness journey. Watch a short video to see how it works.</p>
              {isGeneratingVideo ? (
                  <div className="flex flex-col items-center justify-center p-4">
                      <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <p className="mt-3 text-slate-600 dark:text-slate-400 font-semibold">{videoGenerationMessage}</p>
                  </div>
              ) : (
                  <button 
                      onClick={handleGenerateVideo} 
                      className="inline-flex items-center bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors shadow-md disabled:bg-slate-400"
                  >
                      <PlayCircleIcon className="w-5 h-5 mr-2" />
                      Watch Intro Video
                  </button>
              )}
          </div>

          <div 
              ref={chatContainerRef}
              className="h-[50vh] bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-y-auto"
          >
              {messages.map((msg, index) => (
                  <div key={index} className={`flex items-start gap-3 my-4 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                      {msg.role === 'model' && <div className="p-2 rounded-full bg-blue-500 text-white"><SparklesIcon className="w-5 h-5"/></div>}
                      <div className={`max-w-md p-3 rounded-lg ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200'}`}>
                          <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                      </div>
                      {msg.role === 'user' && <div className="p-2 rounded-full bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300"><UserCircleIcon className="w-5 h-5"/></div>}
                  </div>
              ))}
              {isLoading && messages[messages.length - 1]?.role !== 'model' && (
                   <div className="flex items-start gap-3 my-4">
                      <div className="p-2 rounded-full bg-blue-500 text-white"><SparklesIcon className="w-5 h-5"/></div>
                      <div className="max-w-md p-3 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                          <p className="text-sm animate-pulse">...</p>
                      </div>
                  </div>
              )}
          </div>
          <form onSubmit={sendMessage} className="mt-4">
              <div className="flex items-center gap-2 p-2 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
                  <input
                      type="text"
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-grow bg-transparent p-2 focus:outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                      disabled={isLoading}
                  />
                  <button type="submit" disabled={isLoading || !userInput.trim()} className="bg-blue-600 text-white font-semibold py-2 px-5 rounded-lg hover:bg-blue-700 disabled:bg-slate-400">
                      Send
                  </button>
              </div>
              {error && <p className="text-sm text-red-600 dark:text-red-400 text-center mt-2">{error}</p>}
          </form>
        </div>
      </main>
    </>
  );
};