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
        const recomendantion = recommendationFactory.createRecommendation();
        const response = await supertest(app).post("/recommendations").send(recomendantion);
        const status = response.status;

        const findRecommendationInDatabse = await prisma.recommendation.findUnique({
            where: {
                name: recomendantion.name
            }
        });

        expect(recomendantion.name).toBe(findRecommendationInDatabse.name);
        expect(recomendantion.youtubeLink).toBe(findRecommendationInDatabse.youtubeLink)
        expect(status).toEqual(201);
    })
})

afterAll(async () => {
    await prisma.$executeRaw`
          ALTER SEQUENCE recommendations_id_seq RESTART WITH 1
      `
    await prisma.$executeRaw`
          TRUNCATE TABLE recommendations
      `
    await prisma.$disconnect();
  });