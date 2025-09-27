import express from "express";
import dotenv from "dotenv";
import matchRoutes from "./routes/match";

dotenv.config();

const app = express();
app.use(express.json());

app.use("/match", matchRoutes);

app.get("/", (req, res) => {
    res.send("Matching Service is running!");
});

const PORT = process.env.MATCHING_SERVICE_PORT || 3002;

app.listen(PORT, () => {
    console.log(`Matching Service running on port ${PORT}`);
});
