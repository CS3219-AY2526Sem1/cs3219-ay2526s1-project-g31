export default function AuthFooter() {
    return (
        <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
                By signing in, you agree to our{' '}
                <a href="#" className="text-blue-600 hover:text-blue-500 underline">Terms of Service</a>
                {' '}and{' '}
                <a href="#" className="text-blue-600 hover:text-blue-500 underline">Privacy Policy</a>
            </p>
        </div>
    );
}
