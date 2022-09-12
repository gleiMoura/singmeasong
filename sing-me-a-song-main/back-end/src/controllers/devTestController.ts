import { Response, Request } from "express";
import devTestService from "../services/devTestService.js";

export async function reset (res: Response, req: Request) {
	await devTestService.reset();

	res.sendStatus(200);
};

export async function seed (res: Response, req: Request) {
	await devTestService.seed();

	res.sendStatus(200);
};