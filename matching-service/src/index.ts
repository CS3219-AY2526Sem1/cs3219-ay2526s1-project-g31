import app from "./server";

const PORT = process.env.PORT || 3002;

app.listen(PORT, () => {
    console.log(`Matching Service is running on port ${PORT}`);
});