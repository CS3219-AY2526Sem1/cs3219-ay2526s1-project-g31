'use client';
import Header from '@/components/Header';
import Link from 'next/link';
import { useUser } from '@/contexts/UserContext';

export default function Home() {
  const { user } = useUser();

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-900 pt-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-gray-100 mb-4">
              {user?.displayName ? `Welcome back, ${user.displayName}! 👋` : "Welcome back! 👋"}
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Ready to ace your next technical interview? Connect with peers, practice coding problems,
              and improve your problem-solving skills together.
            </p>
            <Link href="/matching" className="inline-block">
              <button className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white text-xl font-semibold px-8 py-4 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl cursor-pointer">
                🤝 Start Matching with Peers
              </button>
            </Link>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-colors">
              <div className="text-3xl mb-4">💻</div>
              <h3 className="text-xl font-semibold text-gray-100 mb-3">Code Together</h3>
              <p className="text-gray-300">
                Collaborate in real-time with peers on coding challenges and technical problems.
              </p>
            </div>

            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-colors">
              <div className="text-3xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold text-gray-100 mb-3">Practice Problems</h3>
              <p className="text-gray-300">
                Access curated coding problems ranging from easy to hard difficulty levels.
              </p>
            </div>

            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-colors">
              <div className="text-3xl mb-4">🚀</div>
              <h3 className="text-xl font-semibold text-gray-100 mb-3">Level Up Your Skills</h3>
              <p className="text-gray-300">
                Sharpen your problem-solving abilities and grow step by step with every challenge you tackle.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}