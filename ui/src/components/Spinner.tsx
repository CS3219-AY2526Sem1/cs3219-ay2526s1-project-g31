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
        blue: 'border-blue-600',
        gray: 'border-gray-600',
        green: 'border-green-600',
        red: 'border-red-600',
        white: 'border-white-600'
    };

    const spinnerElement = (
        <div className="text-center">
            <div className={`inline-block animate-spin rounded-full border-b-2 mb-4 ${sizeClasses[size]} ${colorClasses[color]}`}></div>
            {message && <p className="text-gray-600 font-medium">{message}</p>}
        </div>
    );

    if (fullScreen) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
                {spinnerElement}
            </div>
        );
    }

    return spinnerElement;
}