import { features } from "../constants";

const FeatureSection = () => {
    return (
        <div id="features" className="feature_border">
            <div className="text-center">
                <span className="feature_heading reveal-fade">
                    Features
                </span>
                <h2 className="landing_page_text reveal-up" style={{animationDelay: '100ms'}}>
                    Built for
                    <span className="landing_page_text_gradient">
                        {" "}Better Interview Prep
                    </span>
                </h2>
                <div className="flex flex-wrap mt-10 lg:mt-50">
                    {features.map((feature, index) => (
                        <div key={index} className="w-full sm:1/2 lg:w-1/3 reveal-up" style={{animationDelay: `${150 + index * 80}ms`}}>
                            <div className="flex">
                                <div className="feature_icon">
                                    {feature.icon}
                                </div>
                                <div>
                                    <h5 className="mt-1 mb-6 text-xl">
                                        {feature.text}
                                    </h5>
                                    <p className="text-md p-2 mb-20 text-neutral-500">
                                        {feature.description}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default FeatureSection
