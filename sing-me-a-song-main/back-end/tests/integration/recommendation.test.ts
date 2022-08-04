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
    })
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