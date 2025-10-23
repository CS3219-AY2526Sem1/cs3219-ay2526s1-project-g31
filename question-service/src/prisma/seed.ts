// Moved this file so that yarn build and docker build can work
// can delete this script if not needed
import { PrismaClient } from "@prisma/client";
import fs from "fs";

const prisma = new PrismaClient();

async function seedQuestions() {
  const count = await prisma.question.count();
  if (count > 0) {
    console.log("Questions already exist, skipping seeding.");
    return;
  }

  const rawData = fs.readFileSync("./prisma/seed-data.json", "utf-8");
  const questions = JSON.parse(rawData);

  await prisma.question.createMany({ data: questions });
  console.log(`Seeded ${questions.length} questions!`);
}

async function main() {
  await seedQuestions();
  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});