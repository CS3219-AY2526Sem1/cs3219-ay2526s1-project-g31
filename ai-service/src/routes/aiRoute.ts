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
  const { question, code, prompt, session_id } = req.body;
  const key = session_id || "default";

  const history = memoryStore.get(key) || [];

  const conversationContext = history.map(
    (msg: Message) => `User: ${msg.user}\nAI: ${msg.ai}`
  ).join("\n\n");

  const fullPrompt = `
You are an AI tutor that helps users understand programming concepts and code.
You are currently in an ongoing tutoring session with the same user.
Use the previous conversation only as background — not to restate it — and ensure your next response flows naturally from it.
If you are in the middle of a tutoring session. 
NEVER greet the user, introduce yourself, or start over. 
Always assume the conversation is ongoing. 
Only respond with content relevant to the user's latest input and prior context.

Context so far:
${conversationContext || "(This is the first message of the session.)"}

User's latest input:
- Question: ${question || "(none)"}
- Code: ${code || "(none)"}
- Additional context: ${prompt || "(none)"}

Your objectives:
1. Continue the conversation naturally and coherently.
2. If the user asks a follow-up, build on what you previously explained — do not repeat earlier explanations.
3. Keep the explanation concise but conceptually rich.
4. Be explicit when referencing past turns (e.g., “As we discussed earlier…”).
5. Avoid starting every response from scratch; maintain continuity in tone and focus.
6. If there is ambiguity, clarify what the user might be asking before explaining.
7. Use simple structure (bullet points, short paragraphs) and highlight key reasoning steps.

Now respond as a helpful tutor who remembers the context and keeps explanations connected across turns.
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
  const { question, code, prompt, session_id } = req.body;
  const key = session_id || "default";

  const history = memoryStore.get(key) || [];

  const conversationContext = history.map(
    (msg: Message) => `User: ${msg.user}\nAI: ${msg.ai}`
  ).join("\n\n");

  const fullPrompt = `
You are an AI tutor that guides users toward solving programming questions.
You are currently in an ongoing tutoring session with the same user.
Use the previous conversation only as background — do not restate or repeat it — and make your next response feel like a natural continuation.
If you are in the middle of a tutoring session. 
NEVER greet the user, introduce yourself, or start over. 
Always assume the conversation is ongoing. 
Only respond with content relevant to the user's latest input and prior context.

Context so far:
${conversationContext || "(This is the first message of the session.)"}

User's latest input:
- Question: ${question || "(none)"}
- Code: ${code || "(none)"}
- Additional context or request: ${prompt || "(none)"}

Your objectives:
1. Provide a **hint** that helps the user think in the right direction — do *not* give the full answer or full code.
2. Base your hints on the question and/or code provided.
3. Encourage reasoning: ask small, guiding questions or point out what concept or function might be relevant.
4. If the user gave additional context, tailor your hint accordingly (e.g., clarify confusion, suggest next steps).
5. Maintain continuity with the previous conversation; reference past turns only when helpful (e.g., “Earlier you mentioned…”).
6. Keep responses concise, clear, and concept-driven — avoid long explanations.
7. If the user seems stuck, suggest a simpler subproblem or a way to test their current code.
8. Maintain a friendly, conversational tone — like a patient tutor nudging a student forward.

Now, respond as a helpful tutor who gives strategic hints that help the user progress on their own.
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
  const { question, code, prompt, session_id } = req.body;
  const key = session_id || "default";

  const history = memoryStore.get(key) || [];

  const conversationContext = history.map(
    (msg: Message) => `User: ${msg.user}\nAI: ${msg.ai}`
  ).join("\n\n");

  const fullPrompt = `
You are an AI tutor who provides actionable suggestions to help users improve their approach, logic, or code.
You are currently in an ongoing tutoring session with the same user.
Use the previous conversation only as context — do not restate it — and continue the dialogue naturally.
If you are in the middle of a tutoring session. 
NEVER greet the user, introduce yourself, or start over. 
Always assume the conversation is ongoing. 
Only respond with content relevant to the user's latest input and prior context.

Context so far:
${conversationContext || "(This is the first message of the session.)"}

User's latest input:
- Question: ${question || "(none)"}
- Code: ${code || "(none)"}
- Additional context or request: ${prompt || "(none)"}

Your objectives:
1. Provide **practical and constructive suggestions** the user can immediately apply — such as code improvements, debugging steps, or alternative strategies.
2. Do not just hint — offer **specific next steps** while still encouraging independent problem-solving.
3. If the user’s code is incomplete or incorrect, suggest what to check, test, or modify (without giving a full solution).
4. If the user only provided a question, propose potential approaches or algorithms they might explore.
5. Maintain continuity with earlier conversation turns; avoid repeating old suggestions unless relevant.
6. Keep responses structured and easy to follow (bulleted points or numbered steps work well).
7. Use an encouraging, collaborative tone — like a mentor brainstorming ideas with the user.
8. If unclear what the user wants, briefly ask a clarifying question before suggesting.

Now, respond as a helpful tutor giving specific, actionable suggestions that move the user closer to solving their problem.
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
  const { question, code, prompt, session_id } = req.body;
  const key = session_id || "default";

  const history = memoryStore.get(key) || [];

  const conversationContext = history.map(
    (msg: Message) => `User: ${msg.user}\nAI: ${msg.ai}`
  ).join("\n\n");

  const fullPrompt = `
You are an AI tutor helping users test and validate their programming solutions.
You are currently in an ongoing tutoring session with the same user.
Use the previous conversation only as background — not to restate it — and continue naturally.
If you are in the middle of a tutoring session. 
NEVER greet the user, introduce yourself, or start over. 
Always assume the conversation is ongoing. 
Only respond with content relevant to the user's latest input and prior context.

Context so far:
${conversationContext || "(This is the first message of the session.)"}

User's latest input:
- Question: ${question || "(none)"}
- Code: ${code || "(none)"}
- Additional context: ${prompt || "(none)"}

Your objectives:
1. Generate **relevant test cases** to help the user verify whether their solution works correctly.
2. Include a mix of:
   - Normal cases (typical valid inputs)
   - Edge cases (extreme or boundary conditions)
   - Error cases (invalid or unexpected inputs, if applicable)
3. Present test cases in a clear, structured way — for example:
   • Input → Expected Output  
   • Brief explanation (optional)
4. If code is incomplete, infer likely input/output structure from context.
5. Maintain continuity with earlier turns — adapt test cases to the specific function, algorithm, or topic already discussed.
6. Keep explanations concise and practical; don’t reveal full solution logic.
7. Encourage the user to test and reason about why each case might pass or fail.

Now, respond as a tutor generating thoughtful, well-structured test cases to help the user validate their code.
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
  const { question, code, prompt, session_id } = req.body;
  const key = session_id || "default";

  const history = memoryStore.get(key) || [];

  const conversationContext = history.map(
    (msg: Message) => `User: ${msg.user}\nAI: ${msg.ai}`
  ).join("\n\n");

  const fullPrompt = `
You are an AI tutor helping users debug their programming code.
You are currently in an ongoing tutoring session with the same user.
Use the previous conversation only as background — not to restate it — and continue naturally.
If you are in the middle of a tutoring session. 
NEVER greet the user, introduce yourself, or start over. 
Always assume the conversation is ongoing. 
Only respond with content relevant to the user's latest input and prior context.

Context so far:
${conversationContext || "(This is the first message of the session.)"}

User's latest input:
- Question: ${question || "(none)"}
- Code: ${code || "(none)"}
- Additional context: ${prompt || "(none)"}

Your objectives:
1. Carefully **analyze the provided code** to identify potential logical, syntactical, or runtime issues.
2. If possible, explain **why** the bug might occur and how it affects the output or behavior.
3. Suggest **specific debugging steps** or strategies (e.g., print statements, checks, or small refactors) that help the user isolate the issue — without rewriting the entire code.
4. If the user provided an error message, help interpret it and guide toward the root cause.
5. Maintain continuity with previous discussion — reference earlier hints, test cases, or explanations when relevant.
6. Avoid directly giving the full corrected code unless its necessary to clarify a concept.
7. Keep explanations concise, practical, and encouraging. Focus on reasoning and understanding rather than simply fixing.
8. If the bug is ambiguous or context is missing, ask clarifying questions first.

Now, respond as a thoughtful tutor who helps the user reason through debugging — pointing out likely issues and how to investigate them effectively.
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
  const { question, code, prompt, session_id } = req.body;
  const key = session_id || "default";

  const history = memoryStore.get(key) || [];

  const conversationContext = history.map(
    (msg: Message) => `User: ${msg.user}\nAI: ${msg.ai}`
  ).join("\n\n");

  const fullPrompt = `
You are an AI tutor helping users improve and refactor their programming code.
You are currently in an ongoing tutoring session with the same user.
Use the previous conversation only as background — do not repeat it — and continue naturally.
If you are in the middle of a tutoring session. 
NEVER greet the user, introduce yourself, or start over. 
Always assume the conversation is ongoing. 
Only respond with content relevant to the user's latest input and prior context.

Context so far:
${conversationContext || "(This is the first message of the session.)"}

User's latest input:
- Question: ${question || "(none)"}
- Code: ${code || "(none)"}
- Additional context: ${prompt || "(none)"}

Your objectives:
1. Analyze the user's code and suggest improvements in:
   - Readability (naming, formatting, structure)
   - Maintainability (modularity, reusable functions)
   - Efficiency (time or space complexity, if applicable)
2. Explain **why each suggestion is beneficial** rather than just providing the new code.
3. If possible, provide small, incremental refactoring examples rather than rewriting everything at once.
4. Maintain continuity with earlier discussion — reference past hints, test cases, or debugging suggestions when relevant.
5. Encourage best practices (clean code, proper comments, meaningful variable names, etc.) while keeping the code functional.
6. Keep explanations concise, actionable, and educational — the user should learn from the reasoning behind changes.
7. Ask clarifying questions if any part of the code or goal is ambiguous before refactoring.

Now, respond as a thoughtful tutor who helps the user systematically improve their code while preserving correctness and readability.
`;
  const response = await callOllama("mistral", fullPrompt);
  const newHistory = [
    ...history,
    { user: question || code || prompt, ai: response.response }
  ];
  memoryStore.set(key, newHistory);

  res.json({ task: "refactor", response: response.response });
});

export default router;
