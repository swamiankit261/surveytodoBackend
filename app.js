import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import errorhandler from "errorhandler";
import notifier from "node-notifier";

const app = express();

// Import routes
import userRoutes from "./routes/user.routes.js";
import surveyRoutes from "./routes/survey.routes.js";
import feedbackRoutes from "./routes/feedback.routes.js";

dotenv.config({ path: "./.env" });

// Enable CORS
app.use(cors({ origin: process.env.ORIGIN, credentials: true }));

// Enable JSON body parsing
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

// Enable cookie-parser
app.use(cookieParser());

// Define routes
app.use(`/api/v1/users`, userRoutes);
app.use(`/api/v1/survey`, surveyRoutes);
app.use(`/api/v1/feedbacks`, feedbackRoutes);

// Use errorhandler middleware only in non-production environments
// if (process.env.NODE_ENV !== "production") {
//   app.use(
//     errorhandler({
//       log: (err, str, req) => errorNotification(err, str, req),
//     })
//   );
// }

// Custom error notification function
function errorNotification(err, str, req) {
  const title = `Error in ${req.method} ${req.url}`;
  console.error(`[ERROR] ${title}: ${str}`);

  notifier.notify({
    title: title,
    message: str,
  });
}

export { app };