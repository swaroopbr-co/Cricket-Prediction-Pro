'use client';

import { useState, useEffect } from 'react';

export function CountdownTimer({ targetDate }: { targetDate: Date }) {
    const [timeLeft, setTimeLeft] = useState(getTimeLeft());

    function getTimeLeft() {
        const difference = +new Date(targetDate) - +new Date();
        let display = '';
        let color = 'text-green-400';

        if (difference > 0) {
            const days = Math.floor(difference / (1000 * 60 * 60 * 24));
            const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
            const minutes = Math.floor((difference / 1000 / 60) % 60);
            const seconds = Math.floor((difference / 1000) % 60);

            if (difference > 48 * 60 * 60 * 1000) {
                display = `${days} Days left`;
            } else if (difference < 60 * 60 * 1000) {
                // Less than 1 hour -> Minutes and Seconds
                display = `${minutes}m ${seconds}s`;
                color = 'text-red-500 animate-pulse';
            } else {
                // Less than 48 hours but > 1 hour -> Hours left
                display = `${Math.floor(difference / (1000 * 60 * 60))}h left`;
                color = 'text-yellow-400';
            }
        } else {
            display = 'Closed';
            color = 'text-gray-500';
        }

        return { display, color, difference };
    }

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(getTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, [targetDate]);

    return (
        <span className={`text-xs font-mono font-bold ${timeLeft.color}`}>
            {timeLeft.display}
        </span>
    );
}
