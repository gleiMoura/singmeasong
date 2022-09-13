/* eslint-disable no-undef */
/// <reference types="cypress" />

import recommendationFactory from '../../factories/recommendationFactory';

describe("Do a recommendation", () => {
	it('Should add a recommendation', async () => {
		const recommendation = recommendationFactory.createRecommendation();
		cy.resetDB();

		cy.visit(recommendationFactory.URL_FRONT);
		cy.get("input[placeholder = 'Name']").type(recommendation.name);
		cy.get("input[placeholder = 'https://youtu.be/...']").type(recommendation.link);

		cy.intercept('POST', `${recommendationFactory.URL_BACK}`).as('postRecommendation');
		cy.intercept('GET', `${recommendationFactory.URL_BACK}`).as('getNewRecommendation');
		cy.get('button').click();
		cy.wait('@postRecommendation');
		cy.wait('@getNewRecommendation');

		cy.contains(recommendation.name);
});
});

