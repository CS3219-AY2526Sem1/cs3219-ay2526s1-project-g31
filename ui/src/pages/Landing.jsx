import Navbar from "../components/Navbar";
import HeroSection from "../components/HeroSection";
import FeatureSection from "../components/FeatureSection";
import HowItWorks from "../components/HowItWorks";
import TopicsQuestions from "../components/TopicsQuestions";
import WhyPeerPrep from "../components/WhyPeerPrep";

const LandingPage = () => {
  return (
    <>
      <Navbar />
      <div className="landing_page">
        <HeroSection />
        <FeatureSection />
        <HowItWorks />
        <TopicsQuestions />
        <WhyPeerPrep />
      </div>
    </>
  );
};

export default LandingPage;