import { Response, Request } from "express";
import devTestService from "../services/devTestService.js";

export async function reset (req: Request, res: Response) {
	await devTestService.reset();

	res.sendStatus(200);
};

export async function seed (req: Request, res: Response) {
	await devTestService.seed();

	res.sendStatus(200);
};