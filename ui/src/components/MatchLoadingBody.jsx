
import CircleCountdown from "./Timer";

const Body = () => {
    return (
        <div className="flex flex-col max-w-full h-screen bg-nus_orange">
            <div className="bg-white rounded-2xl shadow-lg p-10 text-center ml-125 mt-45 w-[450px] h-[400px] flex flex-col items-center justify-between">
                <div>
                    <div>
                        <h1 className="text-2xl font-bold mb-4 text-gray-800">
                            Matching in Progress
                        </h1>
                        <p className="text-gray-600 mb-6">
                            Please wait while we find your match...
                        </p>
                        <div className="mt-4">
                            <CircleCountdown />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Body; 