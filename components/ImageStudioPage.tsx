
import React, { useState, useEffect } from 'react';
import { generateImage } from '../services/geminiService';
import { ImageIcon, SparklesIcon } from './IconComponents';

type AspectRatio = '1:1' | '16:9' | '9:16';

const loadingMessages = [
    "Contacting the AI artist...",
    "Mixing the digital paints...",
    "Bringing your vision to life...",
    "This can take a few moments...",
    "Almost there, adding the final touches!"
];

interface ImageStudioPageProps {
    initialPrompt?: string | null;
}

export const ImageStudioPage: React.FC<ImageStudioPageProps> = ({ initialPrompt }) => {
    const [prompt, setPrompt] = useState('');
    const [negativePrompt, setNegativePrompt] = useState('');
    const [style, setStyle] = useState('Photorealistic');
    const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [loadingMessage, setLoadingMessage] = useState(loadingMessages[0]);

    const artStyles = [
        'Photorealistic', 'Watercolor', 'Anime', 'Abstract', 
        'Vintage', 'Minimalist', 'Fantasy', 'Cyberpunk'
    ];

    useEffect(() => {
        let interval: number | undefined;
        if (isLoading) {
            let messageIndex = 0;
            interval = window.setInterval(() => {
                messageIndex = (messageIndex + 1) % loadingMessages.length;
                setLoadingMessage(loadingMessages[messageIndex]);
            }, 3000);
        }
        return () => clearInterval(interval);
    }, [isLoading]);

    useEffect(() => {
        if (initialPrompt) {
            setPrompt(initialPrompt);
        }
    }, [initialPrompt]);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt.trim() || isLoading) return;

        setIsLoading(true);
        setError(null);
        setGeneratedImage(null);
        setLoadingMessage(loadingMessages[0]);

        try {
            const base64Data = await generateImage(prompt, style, aspectRatio, negativePrompt);
            const imageUrl = `data:image/jpeg;base64,${base64Data}`;
            setGeneratedImage(imageUrl);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to generate image.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
            {/* Left Column: Controls */}
            <div className="lg:col-span-1 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl p-6 rounded-2xl shadow-md border border-white/30 flex flex-col">
                <div className="flex items-center mb-4">
                    <SparklesIcon className="w-6 h-6 text-blue-500 mr-2" />
                    <h2 className="font-bold text-slate-800 dark:text-slate-100 text-xl">Image Generation Studio</h2>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                    Use the power of AI to turn your words into unique images. Describe anything you can imagine.
                </p>
                <form onSubmit={handleSubmit} className="flex flex-col flex-grow">
                    <div className="flex flex-col flex-grow space-y-6">
                        <div>
                            <label htmlFor="prompt" className="block mb-2 font-semibold text-sm text-slate-600 dark:text-slate-400">
                                1. Describe your vision
                            </label>
                            <textarea
                                id="prompt"
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="e.g., An impressionist oil painting of a robot reading a book in a cozy, sunlit library."
                                className="w-full h-32 p-3 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                required
                            />
                             <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 p-2 bg-slate-100 dark:bg-slate-700/50 rounded-lg flex gap-2">
                                <span className="flex-shrink-0">💡</span>
                                <span>
                                    <strong>Pro Tip:</strong> Be descriptive! Try adding details like "cinematic lighting", "4K", or moods like "serene" or "vibrant".
                                </span>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="negativePrompt" className="block mb-2 font-semibold text-sm text-slate-600 dark:text-slate-400">
                                2. Exclude from image <span className="font-normal">(Optional)</span>
                            </label>
                            <textarea
                                id="negativePrompt"
                                value={negativePrompt}
                                onChange={(e) => setNegativePrompt(e.target.value)}
                                placeholder="e.g., blurry, text, watermark, ugly, deformed"
                                className="w-full h-24 p-3 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                             <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                Use a "negative prompt" to tell the AI what you don't want to see.
                            </p>
                        </div>

                        <div>
                            <label htmlFor="style" className="block mb-2 font-semibold text-sm text-slate-600 dark:text-slate-400">
                                3. Choose an artistic style
                            </label>
                            <select
                                id="style"
                                value={style}
                                onChange={(e) => setStyle(e.target.value)}
                                className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                {artStyles.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="block mb-2 font-semibold text-sm text-slate-600 dark:text-slate-400">
                                4. Select aspect ratio
                            </label>
                            <div className="flex gap-2">
                                {(['1:1', '16:9', '9:16'] as AspectRatio[]).map(ratio => (
                                    <button
                                        key={ratio}
                                        type="button"
                                        onClick={() => setAspectRatio(ratio)}
                                        className={`flex-1 py-2 text-sm font-semibold rounded-lg border-2 transition-colors ${
                                            aspectRatio === ratio 
                                            ? 'bg-blue-500 text-white border-blue-500' 
                                            : 'bg-transparent text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:border-blue-400 hover:text-blue-500'
                                        }`}
                                    >
                                        {ratio}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="mt-8">
                        <button type="submit" disabled={isLoading || !prompt.trim()} className="w-full bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 disabled:bg-slate-400 flex items-center justify-center">
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Generating...
                                </>
                            ) : (
                                'Generate Image'
                            )}
                        </button>
                    </div>
                </form>
            </div>

            {/* Right Column: Display */}
            <div className="lg:col-span-2 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl p-6 rounded-2xl shadow-md border border-white/30 flex flex-col items-center justify-center">
                {isLoading && (
                    <div className="text-center">
                        <svg className="animate-spin h-12 w-12 text-blue-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <p className="mt-4 font-semibold text-slate-700 dark:text-slate-200">{loadingMessage}</p>
                    </div>
                )}
                {error && (
                    <div className="text-center p-4 bg-red-50 dark:bg-red-900/30 rounded-lg border border-red-200 dark:border-red-500/50">
                        <h3 className="font-bold text-red-800 dark:text-red-200">Generation Failed</h3>
                        <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
                    </div>
                )}
                {!isLoading && !error && generatedImage && (
                    <div className="w-full h-full flex flex-col items-center">
                        <div className="flex-grow flex items-center justify-center w-full mb-4">
                            <img src={generatedImage} alt={prompt} className="max-w-full max-h-full object-contain rounded-lg shadow-lg" />
                        </div>
                        <a 
                            href={generatedImage} 
                            download={`mindfulme-art-${Date.now()}.jpg`}
                            className="bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-800 font-semibold py-2 px-6 rounded-lg hover:bg-slate-700 dark:hover:bg-slate-200 transition-colors"
                        >
                            Download Image
                        </a>
                    </div>
                )}
                 {!isLoading && !error && !generatedImage && (
                     <div className="text-center text-slate-500 dark:text-slate-400">
                         <ImageIcon className="w-24 h-24 mx-auto text-slate-400 dark:text-slate-600" />
                         <p className="mt-4 font-semibold">Your generated image will appear here</p>
                     </div>
                 )}
            </div>
        </div>
    );
};
