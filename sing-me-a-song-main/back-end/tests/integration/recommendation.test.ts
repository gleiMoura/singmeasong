import supertest from "supertest";
import { faker } from "@faker-js/faker";
import { jest } from '@jest/globals';

import app from "../../src/app.js";
import { prisma } from "../../src/database.js";
import recommendationFactory from "../factories/recommendationFactory.js";

beforeEach(async () => {
    await prisma.$executeRaw`
        ALTER SEQUENCE recommendations_id_seq RESTART WITH 1
    `
    await prisma.$executeRaw`
        TRUNCATE TABLE recommendations
    `
});

describe("Recomendations test - integration", () => {
    it("Add a recomendantion", async () => {
        const recommendantion = recommendationFactory.createRecommendation();
        const response = await supertest(app).post("/recommendations").send(recommendantion);
        const status = response.status;

        const findRecommendationInDatabse = await prisma.recommendation.findUnique({
            where: {
                name: recommendantion.name
            }
        });

        expect(recommendantion.name).toBe(findRecommendationInDatabse.name);
        expect(recommendantion.youtubeLink).toBe(findRecommendationInDatabse.youtubeLink)
        expect(status).toEqual(201);
    });

    it("don't add a recommendation because invalid data", async () => {
        const wrongRecommendation = {};
        const response = await supertest(app).post("/recommendations").send(wrongRecommendation);

        expect(response.status).toBe(422);
    });

    it("Vote to upvote ONE time a recommendation", async () => {
        const recommendantion = recommendationFactory.createRecommendation();
        const recommendationData = await prisma.recommendation.create({
            data: recommendantion
        });
        const result = await supertest(app).post(`/recommendations/${recommendationData.id}/upvote`);

        const findRecommendation = await prisma.recommendation.findUnique({
            where: {
                id: recommendationData.id
            }
        });

        expect(result.status).toBe(200);
        expect(findRecommendation.score).toBe(1);
    });

    it("Vote to downvote a recommendation", async () => {
        const recommendantion = recommendationFactory.createRecommendation();
        const recommendationData = await prisma.recommendation.create({
            data: recommendantion
        });
        const result = await supertest(app).post(`/recommendations/${recommendationData.id}/downvote`);

        const findRecommendation = await prisma.recommendation.findUnique({
            where: {
                id: recommendationData.id
            }
        });

        expect(result.status).toBe(200);
        expect(findRecommendation.score).toBe(-1);
    });

    it("If recommendation has 5 downvotes, it must be deleted", async () => {
        const recommendantion = recommendationFactory.createRecommendation();
        const recommendationData = await prisma.recommendation.create({
            data: { ...recommendantion, score: -5 }
        });

        const result = await supertest(app).post(`/recommendations/${recommendationData.id}/downvote`);

        const findRecommendation = await prisma.recommendation.findUnique({
            where: {
                id: recommendationData.id
            }
        });

        expect(result.status).toBe(200);
        expect(findRecommendation).toBe(null);
    });

    it("get a list of 10 recommendations", async () => {
        const min = 10;
        const max = 20;
        const wish = 10;

        const recommendationsNumber = recommendationFactory.createRandomNumber(min, max);

        for (let i = 0; i < recommendationsNumber; i++) {
            const recommendantion = recommendationFactory.createRecommendation();
            await prisma.recommendation.create({ data: recommendantion });
        };

        const result = await supertest(app).get("/recommendations");

        const findRecommendations = await prisma.recommendation.findMany({take: wish, orderBy: { id: 'desc' } });

        expect(result.status).toBe(200);
        expect(result.body.length).toBe(10);
        expect(result.body).toStrictEqual(findRecommendations)
    });
});



afterAll(async () => {
    await prisma.$executeRaw`
          ALTER SEQUENCE recommendations_id_seq RESTART WITH 1
      `
    await prisma.$executeRaw`
          TRUNCATE TABLE recommendations
      `
    await prisma.$disconnect();
});