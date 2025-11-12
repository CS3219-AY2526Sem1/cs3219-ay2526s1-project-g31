/**
 * AI Assistance Disclosure
 * Tool: Microsoft Copilot
 * Scope: See AI-usage-log for details.
 * Author review: See AI-usage-log for details.
 */

interface SpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    color?: 'blue' | 'gray' | 'green' | 'red' | 'white';
    message?: string;
    fullScreen?: boolean;
}

export default function Spinner({
    size = 'md',
    color = 'white',
    message = 'Loading...',
    fullScreen = false
}: SpinnerProps) {
    // Size classes
    const sizeClasses = {
        sm: 'h-6 w-6',
        md: 'h-12 w-12',
        lg: 'h-16 w-16'
    };

    // Color classes
    const colorClasses = {
        blue: 'border-blue-400',
        gray: 'border-gray-400',
        green: 'border-green-400',
        red: 'border-red-400',
        white: 'border-white'
    };

    const spinnerElement = (
        <div className="text-center">
            <div className={`inline-block animate-spin rounded-full border-b-2 mb-4 ${sizeClasses[size]} ${colorClasses[color]}`}></div>
            {message && <p className="text-gray-300 font-medium">{message}</p>}
        </div>
    );

    if (fullScreen) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
                {spinnerElement}
            </div>
        );
    }

    return spinnerElement;
}