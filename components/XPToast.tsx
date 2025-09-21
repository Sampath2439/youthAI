import React, { useState, useEffect } from 'react';

interface XPMessage {
    id: number;
    amount: number;
}

export const XPToast: React.FC = () => {
    const [messages, setMessages] = useState<XPMessage[]>([]);

    useEffect(() => {
        const handleXPGain = (event: CustomEvent<{ amount: number }>) => {
            const newMessage: XPMessage = {
                id: Date.now(),
                amount: event.detail.amount,
            };
            setMessages(prev => [...prev, newMessage]);

            // Automatically remove the message after the animation duration
            setTimeout(() => {
                setMessages(prev => prev.filter(msg => msg.id !== newMessage.id));
            }, 3000);
        };

        window.addEventListener('xp-gain', handleXPGain as EventListener);

        return () => {
            window.removeEventListener('xp-gain', handleXPGain as EventListener);
        };
    }, []);

    return (
        <div className="fixed bottom-24 right-6 z-[100] pointer-events-none">
            {messages.map((msg) => (
                <div
                    key={msg.id}
                    className="xp-toast-animation absolute bottom-0 right-0 bg-gradient-to-br from-amber-400 to-orange-500 text-white font-bold text-lg px-4 py-2 rounded-full shadow-lg"
                >
                    +{msg.amount} XP
                </div>
            ))}
        </div>
    );
};
