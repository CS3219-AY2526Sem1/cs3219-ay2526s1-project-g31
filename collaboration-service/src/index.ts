import app from "./server";

const PORT = process.env.PORT || 3004;

app.listen(PORT, () => {
    console.log(`Collaboration Service is running on port ${PORT}`);
});