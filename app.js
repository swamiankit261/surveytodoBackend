import express from 'express';
import cors from "cors";
import cookieparser from "cookie-parser";
import dotenv from "dotenv";

const app = express();

// import routes
import userRoutes from "./routes/user.routes.js";

dotenv.config({ path: "./.env" });

// Enable CORS
app.use(cors({ origin: process.env.ORIGIN, credentials: true }));

// Enable JSON body parsing
app.use(express.json({ limit: "5mb" }));

app.use(express.urlencoded({ extended: true, limit: "16kb" }));

// Enable cookie-parser
app.use(cookieparser());



// Define routes
app.use(`/api/v1/users`, userRoutes);


export { app };