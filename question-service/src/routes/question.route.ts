import express from "express";
import { Request, Response, NextFunction } from "express";
import { PrismaClient, Topic, Difficulty } from "@prisma/client";

const prisma = new PrismaClient();
const router = express.Router();

// Validate required fields before insert
function validateQuestion(req: Request, res: Response, next: NextFunction) {
  const { title, description, difficulty, topics } = req.body;
  if (!title || !description || !difficulty || !topics || topics.length === 0) {
    return res.status(400).json({
      error: "Missing required fields: title, description, difficulty, topics",
    });
  }
  next();
}

// Create a question
router.post("/", validateQuestion, async (req, res) => {
  try {
    const { title, description, difficulty, topics, mediaUrls, popularity } = req.body;

    const question = await prisma.question.create({
      data: {
        title,
        description,
        difficulty,
        topics,
        mediaUrls: mediaUrls || [],
        popularity: popularity || 0,
      },
    });

    res.status(201).json(question);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Get a random question, can filter by topic or difficulty or both
router.get("/random", async (req, res) => {
  try {
    const { topic, difficulty } = req.query;

    const filters: any = {};

    // normalize difficulty (EASY, MEDIUM, HARD)
    if (difficulty) {
      const normalizedDifficulty = (difficulty as string).trim().toUpperCase();
      filters.difficulty = normalizedDifficulty;
    }

    // normalize topic (ARRAY, GRAPH, STRING, etc.)
    if (topic) {
      const normalizedTopic = (topic as string).trim().toUpperCase();
      filters.topics = { has: normalizedTopic };
    }

    // Fetch questions
    const questions = await prisma.question.findMany({ where: filters });

    if (questions.length === 0) {
      return res.status(404).json({
        error:
          topic || difficulty
            ? `No questions found for the given filters`
            : "No questions found in database",
      });
    }

    // Pick a random question
    const randomIndex = Math.floor(Math.random() * questions.length);
    return res.json(questions[randomIndex]);
  } catch (err: any) {
    console.error("Error fetching random question:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get questions with optional filters
router.get("/", async (req, res) => {
  const { topic, difficulty } = req.query;

  const filters: any = {};
  if (difficulty) filters.difficulty = difficulty;
  if (topic) filters.topics = { has: topic };

  const questions = await prisma.question.findMany({
    where: filters,
    orderBy: { createdAt: "desc" },
  });

  res.json(questions);
});

export default router;
