import React, { useState, useRef, useCallback, useEffect } from 'react';
import { getEmotionFromImage } from '../services/geminiService';
import { addWellnessDataPoint } from '../services/historyService';
import { VideoCameraIcon, FaceSmileIcon } from './IconComponents';

type CameraState = 'idle' | 'running' | 'analyzing' | 'result';

export const EmotionDetector: React.FC = () => {
    const [cameraState, setCameraState] = useState<CameraState>('idle');
    const [isCameraReady, setIsCameraReady] = useState(false);
    const [emotion, setEmotion] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const stopCamera = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        setIsCameraReady(false);
    }, []);

    const startCamera = useCallback(async () => {
        setError(null);
        setEmotion(null);
        setCapturedImage(null);
        setIsCameraReady(false);
        setCameraState('running');

        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: { width: { ideal: 320 }, height: { ideal: 240 } } });
                streamRef.current = stream;
                const videoElement = videoRef.current;
                if (videoElement) {
                    videoElement.srcObject = stream;
                    videoElement.muted = true;
                    videoElement.playsInline = true;

                    videoElement.onloadedmetadata = () => {
                        videoElement.play().catch(err => {
                            console.error("Video play failed:", err);
                            setError("Could not start camera preview.");
                            stopCamera();
                            setCameraState('idle');
                        });
                    };
                    
                    videoElement.onplaying = () => {
                        setIsCameraReady(true);
                    };
                }
            } catch (err) {
                console.error("Error accessing camera:", err);
                if (err instanceof DOMException && (err.name === "NotAllowedError" || err.name === "PermissionDeniedError")) {
                    setError("Camera permission denied. Please allow camera access in your browser settings.");
                } else {
                    setError("Could not access the camera. Please check permissions and ensure it's not in use by another app.");
                }
                stopCamera();
                setCameraState('idle');
            }
        } else {
            setError("Camera not supported on this browser.");
            setCameraState('idle');
        }
    }, [stopCamera]);
    
    useEffect(() => {
        return () => {
            stopCamera();
        };
    }, [stopCamera]);

    const captureAndAnalyze = useCallback(async () => {
        if (!videoRef.current || !isCameraReady || videoRef.current.readyState < 3) {
            setError('Camera is not ready yet. Please wait a moment.');
            return;
        }
        
        const video = videoRef.current;
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext('2d');
        if (!context) {
            setError('Could not process video frame.');
            return;
        }
        
        context.translate(canvas.width, 0);
        context.scale(-1, 1);
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        
        stopCamera();
        setCapturedImage(dataUrl);
        setCameraState('analyzing');
        setError(null);
        setEmotion(null);
        
        const base64Image = dataUrl.split(',')[1];

        try {
            const result = await getEmotionFromImage(base64Image);
            const scoreMap: { [key: string]: number } = {
                'Happy': 95, 'Sad': 20, 'Neutral': 65, 'Surprised': 75, 'Angry': 15, 'Fearful': 25,
            };
            const score = scoreMap[result] || 50;
            addWellnessDataPoint(score, 'emotion');
            setEmotion(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Analysis failed.');
        } finally {
            setCameraState('result');
        }
    }, [stopCamera, isCameraReady]);

    const handleReset = () => {
        stopCamera();
        setCameraState('idle');
        setEmotion(null);
        setCapturedImage(null);
        setError(null);
    };

    const renderCameraView = () => {
        const showPlaceholder = cameraState === 'idle' || (cameraState === 'running' && !isCameraReady);
        return (
            <div className="w-full h-full bg-slate-100 dark:bg-slate-900/50 rounded-lg flex items-center justify-center overflow-hidden relative">
                {capturedImage && (
                     <img src={capturedImage} className="w-full h-full object-cover" alt="Captured for analysis" />
                )}
                
                <video 
                    ref={videoRef} 
                    className={`w-full h-full object-cover transform -scale-x-100 ${cameraState === 'running' ? 'block' : 'hidden'}`} 
                />

                {showPlaceholder && !capturedImage && (
                    <VideoCameraIcon className="h-16 w-16 text-slate-400 dark:text-slate-500" />
                )}
                
                {cameraState === 'analyzing' && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-white">
                        <svg className="animate-spin h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <p className="mt-2 font-semibold">AI is analyzing...</p>
                    </div>
                )}
            </div>
        );
    };

    const renderControls = () => {
        switch(cameraState) {
            case 'idle':
                return (
                    <button onClick={startCamera} className="w-full bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors shadow-md">
                        Start Camera
                    </button>
                );
            case 'running':
                return (
                     <div className="grid grid-cols-2 gap-4">
                        <button onClick={handleReset} className="w-full bg-slate-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-slate-600 transition-colors shadow-md">
                            Stop
                        </button>
                        <button onClick={captureAndAnalyze} disabled={!isCameraReady} className="w-full bg-emerald-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-emerald-600 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors shadow-md">
                            {isCameraReady ? 'Analyze' : 'Preparing...'}
                        </button>
                    </div>
                );
            case 'result':
                return (
                    <button onClick={handleReset} className="w-full bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors shadow-md">
                        Start New Check-in
                    </button>
                );
            default:
                return <div className="h-12" />; // Placeholder for height consistency
        }
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center text-indigo-500 dark:text-indigo-400 mb-2">
                <FaceSmileIcon className="h-8 w-8" />
                <h3 className="font-bold text-slate-800 dark:text-slate-100 ml-3 text-lg">Emotion Check-in</h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                Use your camera for a quick, AI-powered emotion analysis.
            </p>

            <div className="flex-grow flex flex-col justify-center my-4">
                {renderCameraView()}
            </div>
            
            <div className="mt-auto">
                <div className="h-10 mb-2 text-center">
                    {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
                    {cameraState === 'result' && emotion && (
                        <div className="p-2 bg-blue-50 dark:bg-blue-500/10 rounded-lg animate-fade-in inline-block">
                            <p className="text-sm text-slate-600 dark:text-slate-400">AI thinks you look: <span className="font-bold text-blue-700 dark:text-blue-300">{emotion}</span></p>
                        </div>
                    )}
                </div>
                {renderControls()}
            </div>
        </div>
    );
};