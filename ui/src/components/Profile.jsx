import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import logo from "../assets/logo.png";
import { User } from "lucide-react";

const ProfileComponent = () => {
    const navigate = useNavigate();
    const handleBackToHome = () => {
        navigate("/match");
    };

    return (
        <div className="min-h-screen bg-white flex items-center justify-center px-4">
            <button
                onClick={handleBackToHome}
                className="absolute top-6 left-6 flex items-center text-gray-600 hover:text-gray-900 transition-colors z-10"
            >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Start Matching
            </button>

            <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
                <div className="bg-nus_blue p-6 flex items-center justify-center">
                    <div className="flex items-center">
                        <img className="h-10 w-10 mr-3" src={logo} alt="logo" />
                        <span className="text-xl font-bold text-white">PeerPrep</span>
                    </div>
                </div>

                <div className="bg-nus_orange p-8">
                    <div className="max-w-3xl mx-auto bg-white shadow-md rounded-2xl p-6">

                        <div className="flex items-center space-x-4">
                            <div className="p-4 bg-gray-200 rounded-full">
                                <User className="h-12 w-12 text-gray-700" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold">Sample Name</h2>
                                <p className="text-gray-500">sample@example.com</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 mt-6">
                            <div className="bg-gray-50 p-4 rounded-lg text-center">
                                <p className="text-2xl font-bold">12</p>
                                <p className="text-gray-500 text-sm">Sessions</p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg text-center">
                                <p className="text-2xl font-bold">8</p>
                                <p className="text-gray-500 text-sm">Topics</p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg text-center">
                                <p className="text-2xl font-bold">5</p>
                                <p className="text-gray-500 text-sm">Day Streak</p>
                            </div>
                        </div>

                        <div className="mt-8">
                            <h3 className="text-lg font-semibold mb-4">Account Settings</h3>
                            <ul className="space-y-2">
                                <li className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                    <span>Change Password</span>
                                    <button className="text-nus_blue hover:underline">Update</button>
                                </li>
                                <li className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                    <span>Notifications</span>
                                    <button className="text-nus_blue hover:underline">Manage</button>
                                </li>
                            </ul>
                        </div>

                        <div className="flex mt-8 justify-center">
                            <button className="w-full py-2 bg-nus_blue text-white rounded-lg hover:bg-nus_orange">
                                Logout
                            </button>
                            <button className="w-full ml-3 px-4 py-2 bg-nus_blue text-white rounded-lg hover:bg-nus_orange">
                                Edit Profile
                            </button>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
};

export default ProfileComponent;
