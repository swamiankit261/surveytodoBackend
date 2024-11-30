import express from 'express';
import cors from "cors";
import cookieparser from "cookie-parser";

const app = express();

// import routes
import userRoutes from "./routes/user.routes.js";

// Enable CORS
app.use(cors({ origin: process.env.ORIGIN, credentials: true }));

// Enable JSON body parsing
app.use(express.json({ limit: "16kb" }));

app.use(express.urlencoded({ extended: true, limit: "16kb" }));

// Enable cookie-parser
app.use(cookieparser());



// Define routes
app.use(`/api/v1/users`, userRoutes);


export { app };