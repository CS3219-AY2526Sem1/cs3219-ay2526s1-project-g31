import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import logo from "../assets/logo.png";
import { FcGoogle } from "react-icons/fc";
import { Link } from "react-router-dom";


const LoginComponent = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      // Handle OAuth here
      console.log("Google OAuth would be implemented here");
      navigate("/match");
    }, 2000);
  };

  const handleBackToHome = () => {
    navigate("/");
  };

  return (
    <div className="login_page">
      <button
        onClick={handleBackToHome}
        className="back_to_home_text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 rounded"
      >
        <ArrowLeft className="back_to_home_arrow" />
        Back to Home
      </button>

      <div className="login_box">
        <div className="login_blue_bar reveal-up">
          <div className="login_blue_bar_orientation">
            <img className="login_logo" src={logo} alt="logo" />
            <span className="logo_text">PeerPrep</span>
          </div>
        </div>

        <div className="login_orange_box">
          <div className="login_orange_box_orientation reveal-up" style={{animationDelay: '90ms'}}>
            <h1 className="orange_box_text_heading">
              Welcome
            </h1>
            <p className="orange_box_text_body">
              Get started with PeerPrep to practice coding interviews with verified peers
            </p>
          </div>

          <div className="space-y-6 reveal-up" style={{animationDelay: '160ms'}}>
            <button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="google_button focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="google_animation"></div>
                  Getting started...
                </div>
              ) : (
                <div className="flex items-center">
                  <FcGoogle className="w-5 h-5 mr-3" />
                  <span>Continue with Google</span>
                </div>
              )}
            </button>
            <div className="text-center">
              <p className="text-white/90 text-sm">
                Join thousands of students practicing coding interviews together
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginComponent;
