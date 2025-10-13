import { CheckCircle2 } from "lucide-react";
import codeImg from "../assets/code.jpg";
import { checklistItems } from "../constants";

const HowItWorks = () => {
  return (
    <div id="how-it-works" className="mt-20">
      <h2 className="landing_page_text reveal-up">
        A smarter way{" "}
        <span className="landing_page_text_gradient">
          to practice.
        </span>
      </h2>
      <div className="flex flex-wrap justify-center">
        <div className="p-2 w-full lg:w-1/2 reveal-up" style={{animationDelay: '120ms'}}>
          <img src={codeImg} alt="Coding" className="rounded-xl shadow-lg" />
        </div>
        <div className="how_it_works_orientation">
          {checklistItems.map((item, index) => (
            <div key={index} className="flex mb-12 reveal-up" style={{animationDelay: `${140 + index * 80}ms`}}>
              <div className="how_it_works_checkbox">
                <CheckCircle2 />
              </div>
              <div>
                <h5 className="how_it_works_title">{item.title}</h5>
                <p className="how_it_works_description">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
