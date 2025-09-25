export default function AuthHeader() {
  return (
    <div className="text-center mb-8">
      <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      </div>
      <h1 className="text-3xl font-bold text-gray-100 mb-2">Sign in to PeerPrep</h1>
      <p className="text-gray-300">Get started with your Google account</p>
    </div>
  );
}
