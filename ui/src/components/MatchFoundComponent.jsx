import { useState } from "react";
import { Link } from "react-router-dom";

const MatchFoundComponent = () => {
    const [showConfirm, setShowConfirm] = useState(false);
    return (
        <div className="min-h-screen w-screen bg-gradient-to-r from-nus_blue to-nus_orange flex items-center justify-center px-6">
            <div className="max-w-3xl w-full bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-6 sm:p-10">
                <h1 className="text-center text-white text-4xl sm:text-5xl font-bold tracking-tight">🎉 Match Found</h1>
                <p className="text-center text-white/90 mt-2">You’ve been paired! Review details and join when ready.</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-10">
                    <div className="bg-white rounded-xl p-6 shadow-lg flex flex-col items-center text-center">
                        <div className="w-16 h-16 rounded-full bg-nus_orange/20 flex items-center justify-center text-nus_orange font-extrabold text-xl">U1</div>
                        <p className="mt-3 font-semibold text-gray-800">USER 1</p>
                        <p className="text-sm text-gray-500">Ready to collaborate</p>
                    </div>
                    <div className="bg-white rounded-xl p-6 shadow-lg flex flex-col items-center text-center">
                        <div className="w-16 h-16 rounded-full bg-nus_blue/20 flex items-center justify-center text-nus_blue font-extrabold text-xl">U2</div>
                        <p className="mt-3 font-semibold text-gray-800">USER 2</p>
                        <p className="text-sm text-gray-500">Ready to collaborate</p>
                    </div>
                </div>

                <div className="mt-8 bg-white/80 rounded-xl p-4 shadow">
                    <p className="text-gray-700 text-sm"><span className="font-semibold">Session:</span> Peer coding session room prepared. Both users will enter a collaborative space.</p>
                </div>

                <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button className="px-6 py-3 rounded-full bg-nus_orange text-white font-semibold shadow-lg hover:shadow-xl hover:bg-orange-600 active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
                        Join Session
                    </button>
                    <button onClick={() => setShowConfirm(true)} className="px-6 py-3 rounded-full bg-white/20 text-white font-semibold shadow hover:bg-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
                        Match Again
                    </button>
                </div>
            </div>
            {showConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40" onClick={() => setShowConfirm(false)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
                        <h3 className="text-lg font-semibold text-gray-800">Start a new match?</h3>
                        <p className="text-sm text-gray-600 mt-1">This will discard the current pairing and take you back to preferences.</p>
                        <div className="mt-6 flex items-center justify-end gap-3">
                            <button onClick={() => setShowConfirm(false)} className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400">Cancel</button>
                            <Link to="/match" className="px-4 py-2 rounded-lg bg-nus_blue text-white hover:bg-orange-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400">Yes, match again</Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default MatchFoundComponent;