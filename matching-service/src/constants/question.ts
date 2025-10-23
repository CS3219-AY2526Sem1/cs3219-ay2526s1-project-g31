import { normalise } from "../utils/match";

enum Difficulty {
    EASY = 'Easy',
    MEDIUM = 'Medium',
    HARD = 'Hard'
}

enum Topic {
    ARRAY = 'Array',
    STRING = 'String',
    HASH_TABLE = 'Hash Table',
    MATH = 'Math',
    GREEDY = 'Greedy',
    GRAPH = 'Graph',
    TREE = 'Tree',
    DYNAMIC_PROGRAMMING = 'Dynamic Programming',
    RECURSION = 'Recursion',
    BACKTRACKING = 'Backtracking'
}

enum Language {
    PYTHON = 'Python',
    JAVASCRIPT = 'JavaScript',
    JAVA = 'Java',
    CPP = 'C++',
    CSHARP = 'C#',
    GO = 'Go',
    RUBY = 'Ruby'
}

const allDifficulties = Object.values(Difficulty).map(d => normalise(d));
const allTopics = Object.values(Topic).map(t => normalise(t));
const allLanguages = Object.values(Language).map(l => normalise(l));

export { Difficulty, Topic, Language, allDifficulties, allTopics, allLanguages };