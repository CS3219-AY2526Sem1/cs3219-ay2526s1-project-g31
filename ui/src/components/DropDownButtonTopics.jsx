import { useState } from "react";

const topicOptions = [
  {
    label: "Data Structures & Algorithms",
    desc: "Arrays, trees, graphs, recursion, and problem-solving patterns.",
  },
  {
    label: "System Design",
    desc: "Scalable architectures, API design, and real-world design challenges.",
  },
  {
    label: "Object-Oriented Programming",
    desc: "Core OOP principles, design patterns, and code structuring.",
  },
  {
    label: "Database & SQL",
    desc: "Query writing, normalization, indexing, and transactions.",
  },
  {
    label: "Domain-Specific Prep",
    desc: "Choose your track: frontend, backend, ML, or DevOps.",
  },
];

const DropdownButtonTopics = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState("Choose Topic");

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleSelect = (option) => {
    setSelected(option.label);
    setIsOpen(false);
  };

  const selectedMeta = topicOptions.find((o) => o.label === selected);

  return (
    <div className="relative inline-block text-left w-full">
      <button
        onClick={toggleDropdown}
        className="flex w-full h-14 px-4 py-2 bg-white text-black rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 border-2 border-gray-200 hover:border-nus_blue justify-between items-center font-semibold text-lg shadow-sm"
      >
        <span className="truncate">{selected}</span>
        <span className={`ml-2 transition-transform ${isOpen ? "rotate-180" : ""}`}>
          ▼
        </span>
      </button>

      {isOpen && (
        <div className="absolute mt-2 w-full bg-white border border-gray-200 rounded-md shadow-xl z-10 font-sans overflow-hidden">
          <ul>
            {topicOptions.map((option) => (
              <li
                key={option.label}
                onClick={() => handleSelect(option)}
                className="px-4 py-2 hover:bg-gray-50 cursor-pointer"
              >
                <p className="font-medium text-gray-800">{option.label}</p>
                <p className="text-xs text-gray-500">{option.desc}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {selectedMeta && (
        <p className="mt-2 text-sm text-gray-600">
          {selectedMeta.desc}
        </p>
      )}
    </div>
  );
};

export default DropdownButtonTopics;


