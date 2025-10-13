import { BotMessageSquare } from "lucide-react";
import { BatteryCharging } from "lucide-react";
import { Fingerprint } from "lucide-react";
import { ShieldHalf } from "lucide-react";
import { PlugZap } from "lucide-react";
import { GlobeLock } from "lucide-react";
import { Code, Cpu, GitBranch, Server } from "lucide-react";

export const navItems = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Topics & Questions", href: "#topics-questions" },
  { label: "Why PeerPrep", href: "#why-peerprep" },
];

export const topicsQuestions = [
  {
    title: "Arrays & Strings",
    description: "Practice basic to advanced problems on arrays and strings.",
    icon: Code,
  },
  {
    title: "Dynamic Programming",
    description: "Solve optimization problems and build algorithmic thinking.",
    icon: Cpu,
  },
  {
    title: "Graphs & Trees",
    description: "Traversal, shortest path, and tree-based coding challenges.",
    icon: Server,
  },
  {
    title: "System Design",
    description: "Design scalable systems and architectures for real-world scenarios.",
    icon: GitBranch,
  },
  {
    title: "Language-Specific Challenges",
    description: "Python, Java, C++, and JavaScript coding problems.",
    icon: Code,
  },
  {
    title: "Company-Specific Questions",
    description: "Practice questions commonly asked by top tech companies.",
    icon: Cpu,
  },
];

export const features = [
  {
    icon: <BotMessageSquare />,
    text: "Live Coding Practice",
    description:
      "Practice coding interviews in real-time with a verified peer, simulating an actual technical interview environment.",
  },
  {
    icon: <Fingerprint />,
    text: "Customizable Difficulty",
    description:
      "Choose your preferred difficulty and topics to match with a peer who fits your learning needs.",
  },
  {
    icon: <ShieldHalf />,
    text: "Verified Interview Partners",
    description:
      "PeerPrep ensures all coding partners are vetted, giving you a reliable and constructive interview experience.",
  },
  {
    icon: <BatteryCharging />,
    text: "Instant Matchmaking",
    description:
      "Get paired with a compatible peer immediately—no more waiting or grinding alone.",
  },
  {
    icon: <PlugZap />,
    text: "Session Recording & Review",
    description:
      "Record your practice sessions and revisit them to identify areas for improvement and track progress.",
  },
  {
    icon: <GlobeLock />,
    text: "Progress Tracking",
    description:
      "Monitor your interview readiness with insights and stats on completed sessions and skill improvements.",
  },
];


export const checklistItems = [
  {
    title: "Submit a Match Request",
    description:
      "Choose your topics and difficulty, then submit a request to get paired with a coding partner.",
  },
  {
    title: "Practice Live",
    description:
      "Engage in a real-time whiteboard coding session with your verified peer.",
  },
  {
    title: "Get Feedback",
    description:
      "Review the session recording and receive feedback to improve your coding skills.",
  },
  {
    title: "Track Progress",
    description:
      "Monitor your interview readiness and see your growth over time.",
  },
];


export const whyPeerPrepItems = [
  {
    title: "Verified Coding Partners",
    description:
      "Practice with peers who are vetted and verified, ensuring high-quality coding sessions.",
  },
  {
    title: "Real-Time Feedback",
    description:
      "Get immediate feedback during or after your session to quickly improve your skills.",
  },
  {
    title: "Flexible Topics & Difficulty",
    description:
      "Choose any topic and difficulty level, from beginner problems to advanced system design.",
  },
  {
    title: "Track Your Progress",
    description:
      "Monitor your performance over time and see tangible improvements in your coding skills.",
  },
  {
    title: "Peer Collaboration",
    description:
      "Work together, learn from each other, and simulate real interview scenarios.",
  },
];
