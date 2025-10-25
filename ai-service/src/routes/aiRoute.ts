import express from "express";

const router = express.Router();

router.post("/start", async (req, res) => {
    await new Promise(r => setTimeout(r, 500)); // 0.5s delay
    res.json({ message: "Thanks for taking help from our local LLM" });
});


export default router;
