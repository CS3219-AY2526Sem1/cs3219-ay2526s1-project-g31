import app from "./server";

const PORT = process.env.PORT || 3003;

app.listen(PORT, () => {
    console.log(`Question Service is running on port ${PORT}`);
});