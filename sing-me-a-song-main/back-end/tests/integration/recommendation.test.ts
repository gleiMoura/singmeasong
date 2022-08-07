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

    it("get a recommendation by id", async () => {
        const recommendantion = recommendationFactory.createRecommendation();
        const recommendationData = await prisma.recommendation.create({ data: recommendantion });

        const findRecommendation = await prisma.recommendation.findUnique({
            where: {
                id: recommendationData.id
            }
        });

        const result = await supertest(app).get(`/recommendations/${recommendationData.id}`);

        expect(result.statusCode).toBe(200);
        expect(result.body).toStrictEqual(findRecommendation);
    });

    it("should get upvotes greater than 10 recommendation with 70% chance", async () => {
        const maxLenth = 20;
        const minLength = 10;
        const arrLength = recommendationFactory.createRandomNumber(maxLenth, minLength);

        const maxScore = 20;
        const minScore = -5;
        const data = [];

        for(let i = 0; i < arrLength; i++){
            const scoreNumber = recommendationFactory.createRandomNumber(maxScore, minScore);

            data.push({
                name: faker.name.findName(),
                youtubeLink: 'https://youtu.be/1bFz-SVX98g',
                score: scoreNumber
              })
        }

        await prisma.recommendation.createMany({ data });

        let nominator = 0;
        const denominator = 200;
        const responses = [];
        let response = null;

        for(let j = 0; j < denominator; j++) {
            response = await supertest(app).get('/recommendations/random');
            responses.push(response.body.score);
        };

        responses.forEach(element => {
            if(element > 10) {
                nominator++
            }
        });

        let percent = (nominator/denominator);
        console.log("percent have to be 0.7 ---> ", percent)
        if(percent > 0.6 && percent < 0.8) {
            percent = 0.7
        }

        expect(percent).toBe(0.7);
    });

    it("should get between -5 and 10 votes recommendation with 30% chance", async () => {
        const maxLenth = 20;
        const minLength = 10;
        const arrLength = recommendationFactory.createRandomNumber(maxLenth, minLength);

        const maxScore = 20;
        const minScore = -5;
        const data = [];

        for(let i = 0; i < arrLength; i++){
            const scoreNumber = recommendationFactory.createRandomNumber(maxScore, minScore);

            data.push({
                name: faker.name.findName(),
                youtubeLink: 'https://youtu.be/1bFz-SVX98g',
                score: scoreNumber
              })
        }

        await prisma.recommendation.createMany({ data });

        let nominator = 0;
        const denominator = 200;
        const responses = [];
        let response = null;

        for(let j = 0; j < denominator; j++) {
            response = await supertest(app).get('/recommendations/random');
            responses.push(response.body.score);
        };

        responses.forEach(element => {
            if(element >= -5 && element <= 10) {
                nominator++
            }
        });

        let percent = (nominator/denominator);

        console.log("percent have to be 0.3 ---> ", percent)
        if(percent > 0.2 && percent < 0.4) {
            percent = 0.3
        }

        expect(percent).toBe(0.3);
    });

    it("should get catch any recommendation if only exist upvotes with 10 score or more", async () => {
        const maxLenth = 20;
        const minLength = 10;
        const arrLength = recommendationFactory.createRandomNumber(maxLenth, minLength);

        const maxScore = 20;
        const minScore = 10;
        const data = [];

        for(let i = 0; i < arrLength; i++){
            const scoreNumber = recommendationFactory.createRandomNumber(maxScore, minScore);

            data.push({
                name: faker.name.findName(),
                youtubeLink: 'https://youtu.be/1bFz-SVX98g',
                score: scoreNumber
              })
        }

        await prisma.recommendation.createMany({ data });

        let nominator = 0;
        const denominator = 10;
        const responses = [];
        let response = null;

        for(let j = 0; j < denominator; j++) {
            response = await supertest(app).get('/recommendations/random');
            responses.push(response.body.score);
        };

        responses.forEach(element => {
            if(element >= 10) {
                nominator++
            }
        });

        let percent = (nominator/denominator);

        console.log("percent have to be 1 ---> ", percent)
        if(percent > 0.9 && percent < 1.1) {
            percent = 1
        }

        expect(percent).toBe(1);
    });

    it("should get catch any recommendation if only exist upvotes with -5 to 10 score or more", async () => {
        const maxLenth = 20;
        const minLength = 10;
        const arrLength = recommendationFactory.createRandomNumber(maxLenth, minLength);

        const maxScore = 10;
        const minScore = -5;
        const data = [];

        for(let i = 0; i < arrLength; i++){
            const scoreNumber = recommendationFactory.createRandomNumber(maxScore, minScore);

            data.push({
                name: faker.name.findName(),
                youtubeLink: 'https://youtu.be/1bFz-SVX98g',
                score: scoreNumber
              })
        }

        await prisma.recommendation.createMany({ data });

        let nominator = 0;
        const denominator = 10;
        const responses = [];
        let response = null;

        for(let j = 0; j < denominator; j++) {
            response = await supertest(app).get('/recommendations/random');
            responses.push(response.body.score);
        };

        responses.forEach(element => {
            if(element <= 10) {
                nominator++
            }
        });

        let percent = (nominator/denominator);

        console.log("percent have to be 1 ---> ", percent)
        if(percent > 0.9 && percent < 1.1) {
            percent = 1
        }

        expect(percent).toBe(1);
    });

    it("should return 404 if there isn't nothing in database", async () => {
        const response = await supertest(app).get("/recommendations/random");

        expect(response.statusCode).toBe(404);
    });

    it("Should get a number of top recommendations", async () => {
        const maxLenth = 20;
        const minLength = 10;
        const arrLength = recommendationFactory.createRandomNumber(maxLenth, minLength);

        const maxScore = 50;
        const minScore = -5;
        const data = [];

        for(let i = 0; i < arrLength; i++){
            const scoreNumber = recommendationFactory.createRandomNumber(maxScore, minScore);

            data.push({
                name: faker.name.findName(),
                youtubeLink: 'https://youtu.be/1bFz-SVX98g',
                score: scoreNumber
              })
        }

        await prisma.recommendation.createMany({ data });

        const amount = 10;
        const response = await supertest(app).get(`/recommendations/top/${amount}`);
        const findRecommendations = await prisma.recommendation.findMany({ take: amount, orderBy: { score: 'desc' } });
    
        expect(response.body.length).toBe(amount);
        expect(response.body).toStrictEqual(findRecommendations);
        expect(response.statusCode).toBe(200);
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