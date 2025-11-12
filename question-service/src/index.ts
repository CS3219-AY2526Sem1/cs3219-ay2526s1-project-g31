import dotenv from "dotenv";
import path from "path";

/**
 * AI Assistance Disclosure
 * Tool: ChatGPT
 * Scope: Debugged seeding function.
 * Author review: Validated correctness.
 */

dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config({ path: path.resolve(__dirname, "../.env") });

import app from "./server";
import { PrismaClient } from "@prisma/client";
import fs from "fs";

const prisma = new PrismaClient();
const PORT = process.env.QUESTION_SERVICE_PORT!;

async function seedIfNeeded() {
  const count = await prisma.question.count();
  if (count === 0) {
    console.log("Seeding initial questions");
    const raw = fs.readFileSync("./prisma/seed-data.json", "utf-8");
    const questions = JSON.parse(raw);
    await prisma.question.createMany({ data: questions });
    console.log(`Seeded ${questions.length} questions`);
  } else {
    console.log("Questions already exist, skipping seed.");
  }
}

async function startServer() {
  await seedIfNeeded();
  app.listen(PORT, () => {
    console.log(`Question Service running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start service:", err);
});