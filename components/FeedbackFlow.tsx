import React, { useState } from 'react';
import { StarIcon, UserPlusIcon, CheckCircleIcon } from './IconComponents';

const StarRating: React.FC<{ rating: number, setRating: (rating: number) => void }> = ({ rating, setRating }) => (
    <div className="flex justify-center space-x-2">
        {[1, 2, 3, 4, 5].map((star) => (
            <button key={star} onClick={() => setRating(star)} className="focus:outline-none transform transition-transform hover:scale-110">
                <StarIcon 
                    filled={rating >= star}
                    className={`w-10 h-10 transition-colors ${rating >= star ? 'text-amber-400' : 'text-slate-300 dark:text-slate-600'}`} 
                />
            </button>
        ))}
    </div>
);


interface FeedbackFlowProps {
    onClose: () => void;
}

export const FeedbackFlow: React.FC<FeedbackFlowProps> = ({ onClose }) => {
    const [step, setStep] = useState<'feedback' | 'invite' | 'done'>('feedback');
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');

    const handleFeedbackSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Here you would typically send the feedback to a server
        console.log('Feedback submitted:', { rating, comment });
        setStep('invite');
    };
    
    const handleInvite = () => {
        // In a real app, this would trigger the Web Share API or copy a link
        navigator.clipboard.writeText('Join me on Mindfulme! It\'s a great app for mental wellness. https://example.com/invite');
        setStep('done'); // Show a "copied" confirmation
        setTimeout(() => {
           onClose(); // Close the modal after a short delay
        }, 2000);
    };

    const renderContent = () => {
        switch(step) {
            case 'feedback':
                return (
                    <>
                        <div className="p-5 border-b border-slate-200 dark:border-slate-700">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 text-center">How was your session?</h3>
                            <p className="text-sm text-center text-slate-500 dark:text-slate-400">Your feedback helps us improve.</p>
                        </div>
                        <form onSubmit={handleFeedbackSubmit}>
                            <div className="p-6 space-y-6">
                                <StarRating rating={rating} setRating={setRating} />
                                <textarea
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder="Tell us more (optional)..."
                                    className="w-full h-24 p-3 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    aria-label="Feedback comment area"
                                />
                            </div>
                            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 flex justify-end items-center gap-3 rounded-b-2xl">
                                <button type="button" onClick={onClose} className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100">Maybe Later</button>
                                <button type="submit" disabled={rating === 0} className="bg-blue-600 text-white font-bold py-2 px-5 rounded-lg hover:bg-blue-700 disabled:bg-slate-400 transition-colors">Submit Feedback</button>
                            </div>
                        </form>
                    </>
                );
            case 'invite':
                return (
                     <>
                        <div className="p-6 text-center">
                            <UserPlusIcon className="w-16 h-16 mx-auto text-blue-500 mb-4" />
                            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Share the Calm</h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                                Thank you for your feedback! If you found this helpful, consider inviting a friend.
                            </p>
                             <div className="text-left bg-slate-100 dark:bg-slate-700/50 p-3 rounded-lg mt-4 text-sm space-y-1">
                                <p className="font-semibold text-slate-700 dark:text-slate-200">Your friends can:</p>
                                <ul className="list-disc list-inside text-slate-600 dark:text-slate-300">
                                    <li>Chat with our supportive AI coach</li>
                                    <li>Practice guided breathing exercises</li>
                                    <li>Get daily wellness check-ins</li>
                                </ul>
                            </div>
                        </div>
                         <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 flex justify-end items-center gap-3 rounded-b-2xl">
                            <button type="button" onClick={onClose} className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100">Not Now</button>
                            <button type="button" onClick={handleInvite} className="bg-blue-600 text-white font-bold py-2 px-5 rounded-lg hover:bg-blue-700 transition-colors">Invite a Friend</button>
                        </div>
                    </>
                );
            case 'done':
                 return (
                    <div className="p-10 text-center flex flex-col items-center justify-center">
                        <CheckCircleIcon className="w-16 h-16 text-green-500 mb-4" />
                        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Invite Link Copied!</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                           Thank you for sharing. Closing now...
                        </p>
                    </div>
                );
        }
    };


    return (
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="feedback-title"
        >
            <div 
                className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-md w-full m-4 border border-slate-200 dark:border-slate-700 animate-fade-in-up"
                role="document"
            >
                {renderContent()}
            </div>
        </div>
    );
};