import { Link } from "react-router-dom";
import video1 from "../assets/video1.mp4";
import video2 from "../assets/video2.mp4";

const HeroSection = () => {
    return (
        <div id="home" className="flex flex-col items-center mt-6 lg:mt-20">
            <h1 className="hero_heading reveal-up">
                <span>Master Your Technical Interview.</span>
                <span className="landing_page_text_gradient"> Practice Live, Together.</span>
            </h1>
            <p className="hero_description reveal-fade" style={{animationDelay: '120ms'}}>
                Stop grinding alone. PeerPrep matches you with a verified coding partner for whiteboard-style interviews on any topic and difficulty.
            </p>
            <div className="flex justify-center my-10 reveal-up" style={{animationDelay: '180ms'}}>
                <Link to="/login" className="hero_button">
                    Start Today!
                </Link>
            </div>
            <div className="flex mt-10 justify-center reveal-up" style={{animationDelay: '240ms'}}>
                <video autoPlay loop muted className="hero_video">
                    <source src={video1} type="video/mp4" />
                    Your browser does not support video tag.
                </video>
                <video autoPlay loop muted className="hero_video">
                    <source src={video2} type="video/mp4" />
                    Your browser does not support video tag.
                </video>
            </div>
        </div>

    )
}

export default HeroSection
