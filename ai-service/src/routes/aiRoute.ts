import express from "express";
import axios from "axios";

interface Message {
  user: string;
  ai: string;
}

const router = express.Router();

// Temporary in-memory memory store
// Key: sessionId (passed from frontend)
// Value: array of message objects { user, ai }
const memoryStore = new Map();

// Helper to call Ollama
async function callOllama(model: string, prompt: string) {
  try {
    const response = await axios.post("http://localhost:11434/api/generate", {
      model,
      prompt,
      stream: false
    }, { timeout: 60000 });
    return response.data;
  } catch (error: any) {
    console.error("Ollama error:", error.message || error);
    return { error: "Failed to get response from Ollama" };
  }
}

router.post("/explain", async (req, res) => {
  const { question, code, prompt, session_id, numPrompts } = req.body;
  const key = session_id || "default";

  const history = memoryStore.get(key) || [];

  if (numPrompts <= 0) {
    return res.json({
      task: "explain",
      response: "Each user can only ask up to 3 questions per collaborative session. You cannot use the AI service anymore."
    });
  }

  const conversationContext = history.map(
    (msg: Message) => `User: ${msg.user}\nAI: ${msg.ai}`
  ).join("\n\n");

  const fullPrompt = ` You are an AI tutor helping a user understand programming concepts and code.

    - Focus on the user's latest input (question, code, or prompt) and provide a clear, concise explanation.
    - Use a friendly, conversational tone—avoid repetitive phrases like "based on our previous conversation."
    - Do NOT greet the user under any circumstances. 
    - Do NOT say "hello", "hi", "hey", or similar. 
    - Do NOT introduce yourself or start over. 
    - Explain concepts with short paragraphs, bullets, or clear reasoning steps.
    - Use previous conversation only as background if it helps understanding; do not restate it unnecessarily.
    - Prioritize direct, actionable explanations over references to past turns.

    Conversation context (for reference):
    ${conversationContext || "(no prior messages)"}

    User's input:
      - Question: ${question || "(none)"}
      - Code: ${code || "(none)"}
      - Additional context: ${prompt || "(none)"}

    Respond as a helpful tutor. Keep your explanation engaging, concept-focused, and easy to follow.
`;

  const response = await callOllama("mistral", fullPrompt);
  const newHistory = [
    ...history,
    { user: question || code || prompt, ai: response.response }
  ];
  memoryStore.set(key, newHistory);

  res.json({ task: "explain", response: response.response });
});

router.post("/hint", async (req, res) => {
  const { question, code, prompt, session_id, numPrompts } = req.body;
  const key = session_id || "default";

  const history = memoryStore.get(key) || [];

  if (numPrompts <= 0) {
    return res.json({
      task: "hint",
      response: "Each user can only ask up to 3 questions per collaborative session. You cannot use the AI service anymore."
    });
  }
  const conversationContext = history.map(
    (msg: Message) => `User: ${msg.user}\nAI: ${msg.ai}`
  ).join("\n\n");

  const fullPrompt = `You are an AI tutor providing hints to help a user solve programming questions.

    - Focus on the user's latest input (question, code, or prompt) and provide a clear, concise hint.
    - Use a friendly, conversational tone—avoid repetitive phrases like "based on our previous conversation."
    - Do NOT greet the user under any circumstances. 
    - Do NOT say "hello", "hi", "hey", or similar. 
    - Do NOT introduce yourself or start over. 
    - Encourage reasoning by asking guiding questions, suggesting concepts to consider, or pointing to small steps.
    - Do NOT give full solutions or full code.
    - Use previous conversation only as background if it helps clarify your hint; do not restate it unnecessarily.
    - Keep hints short, actionable, and concept-focused.

    Conversation context (for reference):
    ${conversationContext || "(no prior messages)"}

    User's input:
    - Question: ${question || "(none)"}
    - Code: ${code || "(none)"}
    - Additional context: ${prompt || "(none)"}

    Respond as a helpful tutor giving a strategic hint that helps the user progress on their own.
`;

  const response = await callOllama("mistral", fullPrompt);
  const newHistory = [
    ...history,
    { user: question || code || prompt, ai: response.response }
  ];
  memoryStore.set(key, newHistory);

  res.json({ task: "hint", response: response.response });
});

router.post("/suggest", async (req, res) => {
  const { question, code, prompt, session_id, numPrompts } = req.body;
  const key = session_id || "default";

  const history = memoryStore.get(key) || [];

  if (numPrompts <= 0) {
    return res.json({
      task: "suggest",
      response: "Each user can only ask up to 3 questions per collaborative session. You cannot use the AI service anymore."
    });
  }

  const conversationContext = history.map(
    (msg: Message) => `User: ${msg.user}\nAI: ${msg.ai}`
  ).join("\n\n");

  const fullPrompt = `You are an AI tutor providing actionable suggestions to help a user improve their approach, logic, or code.

    - Focus on the user's latest input (question, code, or prompt) and provide clear, practical steps.
    - Suggest specific next steps, debugging checks, or alternative strategies—without giving full solutions.
    - Do NOT greet the user under any circumstances. 
    - Do NOT say "hello", "hi", "hey", or similar. 
    - Do NOT introduce yourself or start over. 
    - Use a friendly, encouraging tone and keep your suggestions concise and easy to follow.
    - Structure responses in short paragraphs, bullets, or numbered steps.
    - Use previous conversation only as background if it helps clarify your suggestions; do not repeat it unnecessarily.

    Conversation context (for reference):
    ${conversationContext || "(no prior messages)"}

    User's input:
    - Question: ${question || "(none)"}
    - Code: ${code || "(none)"}
    - Additional context: ${prompt || "(none)"}

    Respond as a helpful tutor giving actionable suggestions that guide the user toward solving their problem independently.
`;

  const response = await callOllama("mistral", fullPrompt);
  const newHistory = [
    ...history,
    { user: question || code || prompt, ai: response.response }
  ];
  memoryStore.set(key, newHistory);

  res.json({ task: "suggest", response: response.response });
});

router.post("/testcases", async (req, res) => {
  const { question, code, prompt, session_id, numPrompts } = req.body;
  const key = session_id || "default";

  const history = memoryStore.get(key) || [];

  if (numPrompts <= 0) {
    return res.json({
      task: "testcases",
      response: "Each user can only ask up to 3 questions per collaborative session. You cannot use the AI service anymore."
    });
  }

  const conversationContext = history.map(
    (msg: Message) => `User: ${msg.user}\nAI: ${msg.ai}`
  ).join("\n\n");

  const fullPrompt = `You are an AI tutor helping a user generate test cases to validate their programming solutions.

    - Focus on the user's latest input (question, code, or prompt) and provide clear, relevant test cases.
    - Do NOT greet the user under any circumstances. 
    - Do NOT say "hello", "hi", "hey", or similar. 
    - Do NOT introduce yourself or start over. 
    - Include a mix of normal cases, edge cases, and error cases (if applicable).
    - Present each test case in a simple, structured way, e.g.:
      • Input → Expected Output
      • Optional brief explanation
    - Do not reveal the full solution logic; the goal is to guide testing and reasoning.
    - Use previous conversation only as background if it helps clarify test case selection; do not restate it unnecessarily.
    - Keep explanations concise, practical, and easy to follow.

    Conversation context (for reference):
    ${conversationContext || "(no prior messages)"}

    User's input:
    - Question: ${question || "(none)"}
    - Code: ${code || "(none)"}
    - Additional context: ${prompt || "(none)"}

    Respond as a helpful tutor generating well-structured, actionable test cases to help the user verify their code.
`;

  const response = await callOllama("mistral", fullPrompt);
  const newHistory = [
    ...history,
    { user: question || code || prompt, ai: response.response }
  ];
  memoryStore.set(key, newHistory);

  res.json({ task: "testcases", response: response.response });
});

router.post("/debug", async (req, res) => {
  const { question, code, prompt, session_id, numPrompts } = req.body;
  const key = session_id || "default";

  const history = memoryStore.get(key) || [];

  if (numPrompts <= 0) {
    return res.json({
      task: "debug",
      response: "Each user can only ask up to 3 questions per collaborative session. You cannot use the AI service anymore."
    });
  }

  const conversationContext = history.map(
    (msg: Message) => `User: ${msg.user}\nAI: ${msg.ai}`
  ).join("\n\n");

  const fullPrompt = `You are an AI tutor helping a user debug their programming code.

    - Focus on the user's latest input (question, code, or prompt) and provide clear, actionable guidance.
    - Analyze the code to identify potential logical, syntactical, or runtime issues.
    - Do NOT greet the user under any circumstances. 
    - Do NOT say "hello", "hi", "hey", or similar. 
    - Do NOT introduce yourself or start over. 
    - Explain why a bug might occur and how it affects behavior, if applicable.
    - Suggest practical debugging steps or strategies (e.g., print statements, checks, small refactors) without rewriting the full code.
    - If the user provided an error message, help interpret it and guide toward the root cause.
    - Use previous conversation only as background if it helps clarify your suggestions; do not restate it unnecessarily.
    - Keep explanations concise, practical, and encouraging—focus on reasoning and understanding.

    Conversation context (for reference):
    ${conversationContext || "(no prior messages)"}

    User's input:
    - Question: ${question || "(none)"}
    - Code: ${code || "(none)"}
    - Additional context: ${prompt || "(none)"}

    Respond as a thoughtful tutor guiding the user through debugging, highlighting likely issues and how to investigate them effectively.
`;

  const response = await callOllama("mistral", fullPrompt);
  const newHistory = [
    ...history,
    { user: question || code || prompt, ai: response.response }
  ];
  memoryStore.set(key, newHistory);

  res.json({ task: "debug", response: response.response });
});

router.post("/refactor", async (req, res) => {
  const { question, code, prompt, session_id, numPrompts } = req.body;
  const key = session_id || "default";

  const history = memoryStore.get(key) || [];

  if (numPrompts <= 0) {
    return res.json({
      task: "refactor",
      response: "Each user can only ask up to 3 questions per collaborative session. You cannot use the AI service anymore."
    });
  }

  const conversationContext = history.map(
    (msg: Message) => `User: ${msg.user}\nAI: ${msg.ai}`
  ).join("\n\n");

  const fullPrompt = `You are an AI tutor helping a user improve and refactor their programming code.

    - Focus on the user's latest input (question, code, or prompt) and provide clear, actionable suggestions.
    - Do NOT greet the user under any circumstances. 
    - Do NOT say "hello", "hi", "hey", or similar. 
    - Do NOT introduce yourself or start over. 
    - Suggest improvements in:
      • Readability (naming, formatting, structure)
      • Maintainability (modularity, reusable functions)
      • Efficiency (time or space complexity, if applicable)
    - Explain why each suggestion is beneficial rather than just giving new code.
    - Provide small, incremental refactoring examples rather than rewriting everything at once.
    - Encourage best practices (clean code, proper comments, meaningful variable names) while keeping the code functional.
    - Use previous conversation only as background if it helps clarify suggestions; do not repeat it unnecessarily.
    - Keep explanations concise, actionable, and educational—help the user learn from the reasoning behind changes.
    - Ask clarifying questions if any part of the code or goal is unclear.

    Conversation context (for reference):
    ${conversationContext || "(no prior messages)"}

    User's input:
    - Question: ${question || "(none)"}
    - Code: ${code || "(none)"}
    - Additional context: ${prompt || "(none)"}

    Respond as a thoughtful tutor guiding the user to systematically improve their code while preserving correctness and readability.
`;

  const response = await callOllama("mistral", fullPrompt);
  const newHistory = [
    ...history,
    { user: question || code || prompt, ai: response.response }
  ];
  memoryStore.set(key, newHistory);

  res.json({ task: "refactor", response: response.response });
});

router.post("/clear", async (req, res) => {
  try {
    const { userIds } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: "userIds must be a non-empty array." 
      });
    }

    let deletedCount = 0;

    for (const userId of userIds) {
      if (memoryStore.has(userId)) {
        memoryStore.delete(userId);
        deletedCount++;
      }
    }

    return res.status(200).json({
      success: true,
      message: `Cleared data for ${deletedCount} user(s).`,
      deletedUsers: userIds.filter(id => !memoryStore.has(id))
    });

  } catch (error: any) {
    console.error("Error clearing user sessions:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while clearing sessions.",
    });
  }
});

export default router;
