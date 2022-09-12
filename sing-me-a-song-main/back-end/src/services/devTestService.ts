import devTestRepository from "../repositories/devTestReposityory.js"

async function reset() {
	await devTestRepository.reset();
};

async function seed() {
	await devTestRepository.seed();
};

const devTestService = {
	reset,
	seed
};

export default devTestService;