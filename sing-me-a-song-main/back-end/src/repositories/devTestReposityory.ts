import { prisma } from "../database.js";
import recomendantionFactory from "../../tests/factories/recommendationFactory.js";

async function reset () {
  await prisma.$executeRaw`
        ALTER SEQUENCE recommendations_id_seq RESTART WITH 1
    `
  await prisma.$executeRaw`
        TRUNCATE TABLE recommendations
    `
};

async function seed () {
  await prisma.recommendation.create({ data: recomendantionFactory.createRecommendation() });
};

const devTestRepository = {
  reset,
  seed
}

export default devTestRepository;
