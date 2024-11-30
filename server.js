import { app } from "./app.js";
import http from "http";
import { v2 as Cloudinary } from 'cloudinary';
import { connectDatabase, disconnectDatabase } from "./config/db.js";

const config = {
    port: process.env.PORT ?? 8000,
    path: "./.env",
};


const PORT = config.port;


// cloudinary configuration
Cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});


app.use((err, req, res, next) => {
    console.error(err.stack); // Log the stack trace
    res.status(err.status ?? 500).json({ message: err.message ?? "Internal Server Error" });
});

const server = http.createServer(app);

server.setMaxListeners(20);

server.on("request", (req, res) => {
    console.log("Request received!");
});

// Handle SIGINT for graceful shutdown
process.on("SIGINT", async () => {
    console.log("Server shutting down gracefully...");
    try {
        await disconnectDatabase(); // Close the database connection
        console.log("Database connections closed.");
    } catch (err) {
        console.error("Error closing database connections", err);
    }
    process.exit(0);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
    console.error("Unhandled Rejection at:", promise, "reason:", reason);
    process.exit(1);
});

// Connect to the database and start the server
connectDatabase().then(() => {
    server.listen(PORT, "0.0.0.0", () => {
        const address = server.address();
        const host = address?.address === "::" || address?.address === "0.0.0.0" ? "localhost" : address?.address;
        const port = address?.port;
        console.log(`Server is running on http://${host}:${port}`);
    });
}).catch((err) => {
    console.error("MongoDB connection failed!", err);
});
