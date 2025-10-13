import DropdownButtonDifficulty from "./DropDownButtonDifficulty";
import DropdownButtonTopics from "./DropDownButtonTopics";
import StartMatchingButton from "./StartMatchingButton";
import { Link } from "react-router-dom";

const Body = () => {
    return (
        <div className="min-h-screen bg-gradient-to-b from-nus_orange to-orange-600/80">
            <div className="max-w-3xl mx-auto pt-32 px-6">
                <div className="bg-white rounded-2xl shadow-2xl p-8 reveal-up">
                    <h1 className="text-3xl font-bold text-gray-800 mb-6">Choose Your Preferences</h1>
                    <div className="grid grid-cols-1 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
                            <DropdownButtonDifficulty />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Topics</label>
                            <DropdownButtonTopics />
                        </div>
                    </div>
                    <div className="flex justify-center mt-8">
                        <Link to="/match_loading">
                            <StartMatchingButton />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Body; 