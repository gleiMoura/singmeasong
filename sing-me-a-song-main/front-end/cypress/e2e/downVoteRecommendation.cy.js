/* eslint-disable no-undef */
/// <reference types="cypress" />

import recommendationFactory from '../../factories/recommendationFactory'

describe('Home screen', () => {
	it('Should downvote a recomendation', async () => {
		cy.resetDB();

		cy.intercept('GET', `${recommendationFactory.URL_BACK}`).as('getRecommendation');
		cy.visit(recommendationFactory.URL_FRONT);
		cy.wait('@getRecommendation');

		cy.intercept('POST', `${recommendationFactory.URL_BACK}/1/downvote`).as('downvote');
		cy.get('article div svg').eq(1).click();
		cy.wait('@downvote');

		cy.get('article div').eq(4).should('contain.text', -1);
	});
});