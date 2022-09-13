import cors from "cors";
import express from "express";
import "express-async-errors";
import dotenv from "dotenv";
import { errorHandlerMiddleware } from "./middlewares/errorHandlerMiddleware.js";
import recommendationRouter from "./routes/recommendationRouter.js";
import devTestRouter from "./routes/devTestRouter.js";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/recommendations", recommendationRouter);

if(process.env.NODE_ENV === 'tests') {
	app.use("/recommendations", devTestRouter);
};

app.use(errorHandlerMiddleware);

export default app;
