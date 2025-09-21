import React, { useState, useRef, useCallback } from 'react';
import { getEmotionFromSpeech } from '../services/geminiService';
import { addWellnessDataPoint } from '../services/historyService';
import { MicrophoneIcon } from './IconComponents';

// Helper to convert blob to base64
const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64data = reader.result as string;
            resolve(base64data.split(',')[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

export const SpeechEmotionDetector: React.FC = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [emotion, setEmotion] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    const startRecording = useCallback(async () => {
        setError(null);
        setEmotion(null);
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
                mediaRecorderRef.current = mediaRecorder;
                audioChunksRef.current = [];

                mediaRecorder.ondataavailable = (event) => {
                    audioChunksRef.current.push(event.data);
                };

                mediaRecorder.onstop = async () => {
                    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                    analyzeAudio(audioBlob);
                    stream.getTracks().forEach(track => track.stop());
                };

                mediaRecorder.start();
                setIsRecording(true);

                // Stop recording after 5 seconds
                setTimeout(() => {
                    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
                        mediaRecorderRef.current.stop();
                        setIsRecording(false);
                    }
                }, 5000);

            } catch (err) {
                console.error("Error accessing microphone:", err);
                setError("Could not access the microphone. Please check permissions.");
                setIsRecording(false);
            }
        } else {
            setError("Audio recording not supported on this browser.");
        }
    }, []);

    const analyzeAudio = useCallback(async (audioBlob: Blob) => {
        if (!audioBlob || audioBlob.size === 0) return;
        setIsLoading(true);
        setError(null);
        setEmotion(null);

        try {
            const base64Audio = await blobToBase64(audioBlob);
            const result = await getEmotionFromSpeech(base64Audio, audioBlob.type);
            const scoreMap: { [key: string]: number } = {
                'Happy': 90, 'Sad': 25, 'Anxious': 30, 'Calm': 85, 'Angry': 15, 'Surprised': 75,
            };
            const score = scoreMap[result] || 50;
            addWellnessDataPoint(score, 'emotion');
            setEmotion(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Analysis failed.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const renderControls = () => {
        if (isLoading || isRecording) {
            return (
                <button disabled className="w-full bg-indigo-600/50 text-white font-bold py-3 px-6 rounded-lg transition-colors shadow-md flex items-center justify-center">
                    {isLoading && <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                    {isRecording ? 'Recording...' : 'Analyzing...'}
                </button>
            );
        }
        
        return (
            <button onClick={startRecording} className="w-full bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors shadow-md">
                Start Recording
            </button>
        );
    }

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center text-indigo-500 dark:text-indigo-400 mb-2">
                <MicrophoneIcon className="h-8 w-8" />
                <h3 className="font-bold text-slate-800 dark:text-slate-100 ml-3 text-lg">Speech Emotion Check-in</h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
               Record a short 5-second clip of your voice for an AI-powered emotion analysis from its tone.
            </p>

            <div className="flex-grow flex items-center justify-center bg-slate-100 dark:bg-slate-900/50 rounded-lg my-4">
                <MicrophoneIcon className={`h-16 w-16 transition-colors duration-300 ${isRecording ? 'text-red-500 animate-pulse' : 'text-slate-400 dark:text-slate-500'}`} />
            </div>

            <div className="mt-auto">
                 <div className="h-10 mb-2 text-center">
                    {error && <p className="text-sm text-red-600 dark:text-red-400 text-center">{error}</p>}
                    {emotion && !isLoading && (
                        <div className="p-2 bg-blue-50 dark:bg-blue-500/10 rounded-lg animate-fade-in inline-block">
                             <p className="text-sm text-slate-600 dark:text-slate-400">AI detected a tone of: <span className="font-bold text-blue-700 dark:text-blue-300">{emotion}</span></p>
                        </div>
                    )}
                </div>
                {renderControls()}
            </div>
        </div>
    );
};