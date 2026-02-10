import { Wifi, WifiOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ConnectionStatusProps {
    isConnected: boolean;
    error?: string | null;
}

export function ConnectionStatus({ isConnected, error }: ConnectionStatusProps) {
    if (!error && isConnected) {
        return (
            <Badge variant="outline" className="flex items-center gap-2 border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-400">
                <span className="inline-block h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                <Wifi className="h-3 w-3" />
                <span className="text-xs">Live</span>
            </Badge>
        );
    }

    if (error) {
        return (
            <Badge variant="outline" className="flex items-center gap-2 border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400">
                <WifiOff className="h-3 w-3" />
                <span className="text-xs">
                    {error === "No authentication token found" ? "Login Required" : "Connection Error"}
                </span>
                {error !== "No authentication token found" && error && (
                    <span className="text-[10px] opacity-70 ml-1">({typeof error === 'string' ? error.substring(0, 15) : 'Error'})</span>
                )}
            </Badge>
        );
    }

    return (
        <Badge variant="outline" className="flex items-center gap-2 border-yellow-500/30 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400">
            <span className="inline-block h-2 w-2 rounded-full bg-yellow-500 animate-pulse"></span>
            <WifiOff className="h-3 w-3" />
            <span className="text-xs">Reconnecting...</span>
        </Badge>
    );
}
