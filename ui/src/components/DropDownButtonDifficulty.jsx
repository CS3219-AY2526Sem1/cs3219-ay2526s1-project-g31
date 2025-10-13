import { useState } from "react";

const DropdownButtonDifficulty = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState("Choose Difficulty");

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleSelect = (option) => {
    setSelected(option); 
    setIsOpen(false); 
  };

  const options = ["Easy", "Medium", "Hard"];

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={toggleDropdown}
        className="flex w-80 h-18 px-4 py-2 bg-white text-black rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 border-2 border-gray-200 hover:border-gray-300 justify-between items-center font-semibold text-xl shadow-sm"
      >
        <span>{selected}</span>
        <span className={`ml-2 transition-transform ${isOpen ? "rotate-180" : ""}`}>
          ▼
        </span>
      </button>

      {isOpen && (
        <div className="absolute mt-2 w-80 bg-white border border-gray-200 rounded-md shadow-xl z-10 font-sans overflow-hidden">
          <ul>
            {options.map((option) => (
              <li
                key={option}
                onClick={() => handleSelect(option)}
                className="px-4 py-2 hover:bg-gray-50 cursor-pointer"
              >
                {option}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default DropdownButtonDifficulty;
