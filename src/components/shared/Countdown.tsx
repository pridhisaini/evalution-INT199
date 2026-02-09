"use client";

import { useEffect, useState } from "react";
import { intervalToDuration, isPast, type Duration } from "date-fns";

interface CountdownProps {
    endTime: Date;
    onEnd?: () => void;
    className?: string;
}

export function Countdown({ endTime, onEnd, className }: CountdownProps) {
    const [timeLeft, setTimeLeft] = useState<Duration | null>(null);

    useEffect(() => {
        const timer = setInterval(() => {
            if (isPast(endTime)) {
                clearInterval(timer);
                setTimeLeft(null);
                onEnd?.();
                return;
            }
            setTimeLeft(intervalToDuration({ start: new Date(), end: endTime }));
        }, 1000);

        return () => clearInterval(timer);
    }, [endTime, onEnd]);

    if (!timeLeft) return <span className={className}>Closed</span>;

    const { days, hours, minutes, seconds } = timeLeft;

    if (days && days > 0) {
        return <span className={className}>{days}d {hours}h left</span>
    }

    const parts = [];
    if (hours) parts.push(`${hours}h`);
    parts.push(`${minutes || 0}m`);
    parts.push(`${seconds || 0}s`);

    return <span className={className}>{parts.join(" ")}</span>;
}
