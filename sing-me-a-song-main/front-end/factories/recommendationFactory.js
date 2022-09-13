import { faker } from "@faker-js/faker";
import dotenv from "dotenv";
dotenv.config();

const URL_FRONT = 'localhost:3000';
const URL_BACK = 'localhost:4000/recommendations';

function createRecommendation() {
	return {
		name: faker.name.fullName(),
		link: 'https://www.youtube.com/watch?v=nNhMjV76OQo'
	}
};

const recommendationFactory = {
	URL_FRONT,
	URL_BACK,
	createRecommendation
};

export default recommendationFactory;