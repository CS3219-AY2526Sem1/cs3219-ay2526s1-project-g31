import { whyPeerPrepItems } from "../constants";

const WhyPeerPrep = () => {
  return (
    <div id="why-peerprep" className="landing_page_border">
      <h2 className="landing_page_text reveal-up">
        Why{" "}
        <span className="landing_page_text_gradient">
          PeerPrep
        </span>
      </h2>
      <div className="flex flex-wrap">
        {whyPeerPrepItems.map((item, index) => (
          <div key={index} className="landing_page_box reveal-up" style={{animationDelay: `${120 + index * 60}ms`}}>
            <div className="landing_page_box_content">
              <p className="landing_page_box_title">{item.title}</p>
              <p className="why_peer_prep_box_description">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WhyPeerPrep;
