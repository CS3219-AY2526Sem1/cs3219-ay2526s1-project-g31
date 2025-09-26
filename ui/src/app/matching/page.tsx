import "./matchingPage.css";

export default function MatchingPage() {
    return (
        <div className="relative min-h-screen flex flex-col">
            {/* Heading */}
            <h1 className="absolute top-10 left-1/2 transform -translate-x-1/2 text-white text-5xl font-bold z-10">
                Matching Successful
            </h1>

            {/* Two side-by-side boxes */}
            <div className="flex flex-1 h-screen">
                <div className="flex-1 bg-[#003D7C]"></div>
                <div className="flex-1 bg-[#EF7C00]"></div>
            </div>
        </div>
    )
}