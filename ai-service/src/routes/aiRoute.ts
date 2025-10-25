import express from "express";

const router = express.Router();

router.post("/explain", async (req, res) => {
    await new Promise(r => setTimeout(r, 500)); // 0.5s delay
    res.json({ message: "Here is the explaination you wanted." });
});

router.post("/hint", async (req, res) => {
    await new Promise(r => setTimeout(r, 500)); // 0.5s delay
    res.json({ message: "Here is a hint that can help you solve the problem." });
});

router.post("/suggest", async (req, res) => {
    await new Promise(r => setTimeout(r, 500)); // 0.5s delay
    res.json({ message: "This is how I would suggest to go about the problem." });
});

router.post("/testcases", async (req, res) => {
    await new Promise(r => setTimeout(r, 500)); // 0.5s delay
    res.json({ message: "Some testcases you can use to test the code." });
});

router.post("/debug", async (req, res) => {
    await new Promise(r => setTimeout(r, 500)); // 0.5s delay
    res.json({ message: "I think the problem in the code lies here." });
});

router.post("/refactor", async (req, res) => {
    await new Promise(r => setTimeout(r, 500)); // 0.5s delay
    res.json({ message: "Refactored code would look something like this." });
});

export default router;
