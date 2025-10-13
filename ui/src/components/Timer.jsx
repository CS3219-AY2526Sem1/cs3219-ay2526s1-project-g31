import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { AlertCircle } from "lucide-react";

const CircleCountdown = () => {
  const TOTAL_SECONDS = 30;
  const [secondsLeft, setSecondsLeft] = useState(TOTAL_SECONDS);

  useEffect(() => {
    if (secondsLeft === 0)
      return;

    const timer = setInterval(() => {
      setSecondsLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsLeft]);

  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const progress = circumference - (secondsLeft / TOTAL_SECONDS) * circumference;

  const formatTime = (sec) => {
    const minutes = Math.floor(sec / 60);
    const seconds = sec % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  if (secondsLeft === 0) {
    return (
      <div className="text-center reveal-up">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-nus_blue/10 mb-3">
          <AlertCircle className="w-8 h-8 text-nus_blue" />
        </div>
        <h3 className="text-xl font-semibold text-gray-800">No match found right now</h3>
        <p className="text-gray-600 mt-1 px-6">
          Try a different difficulty or check back shortly. We'll keep improving your match quality.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to='/match'>
            <button className="px-4 py-2 bg-nus_blue text-white rounded-lg shadow hover:bg-orange-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400">
              Change preferences
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col items-center justify-center">
      <svg className="transform -rotate-90" width={200} height={200}>
        <circle
          cx={100}
          cy={100}
          r={radius}
          stroke="#e5e7eb"
          strokeWidth={15}
          fill="transparent"
        />
        <circle
          cx={100}
          cy={100}
          r={radius}
          stroke="#ef7c00"
          strokeWidth={15}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={progress}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute text-4xl font-bold mt-[-0rem] text-nus_blue">
        {formatTime(secondsLeft)}
      </div>
      <p className="mt-4 text-sm text-gray-600">Finding your partner...</p>
    </div>
  );
};

export default CircleCountdown;
