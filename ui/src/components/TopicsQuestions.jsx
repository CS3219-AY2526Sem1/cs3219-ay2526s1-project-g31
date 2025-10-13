import { topicsQuestions } from "../constants";

const TopicsQuestions = () => {
  return (
    <div id="topics-questions" className="landing_page_border">
      <h2 className="landing_page_text reveal-up">
        What You{" "}
        <span className="landing_page_text_gradient">
          Can Practice
        </span>
      </h2>
      <div className="flex flex-wrap">
        {topicsQuestions.map((topic, index) => {
          const Icon = topic.icon;
          return (
            <div key={index} className="landing_page_box reveal-up" style={{animationDelay: `${120 + index * 60}ms`}}>
              <div className="landing_page_box_content">
                <div className="text-orange-500 mb-4 w-12 h-12">
                  <Icon className="w-full h-full" />
                </div>
                <p className="landing_page_box_title">{topic.title}</p>
                <p className="landing_box_description">{topic.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TopicsQuestions;
