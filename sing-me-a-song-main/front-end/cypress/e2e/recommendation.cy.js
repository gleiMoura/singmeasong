/// reference Types="cypress" />

import { faker } from "@faker-js/faker";
import dotenv from "dotenv";
dotenv.config();

const URL_FRONT = 'localhost:3000';
const URL_BACK = 'localhost:5000/recommendations';

describe("Do a recommendation", () => {
	it('Should add a recommendation', async () => {

		cy.intercept('GET', URL_BACK).as('getRecommendations');
		cy.visit(URL_FRONT);
		cy.wait('getRecommendations');

		const recommendation = createRecommendation();
		cy.get('input[placeholder = Name]').type(recommendation.name);
		cy.get("input[placeholder = 'https://youtu.be/...']").type(recommendation.link);

		cy.intercept('POST', URL_BACK).as('postRecommendation');
		cy.intercept('GET', URL_BACK).as('getNewRecommendation');
		cy.get('button').click();
		cy.wait('postRecommendation');
		cy.wait('getNewRecommendation');

		cy.get('article div:first').should('contain.text', recommendation.name)
});
});

function createRecommendation() {
	return {
		name: faker.name.fullName(),
		link: 'https://www.youtube.com/watch?v=nNhMjV76OQo'
	}
};