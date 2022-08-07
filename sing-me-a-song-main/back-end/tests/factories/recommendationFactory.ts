import { faker, Faker } from "@faker-js/faker";

function createRecommendation(): {name: string, youtubeLink: string} {
    return {
        name: faker.name.findName(), 
        youtubeLink: "https://www.youtube.com/watch?v=Glf5iwea1iE"
    };
};

function createRandomNumber(max: number, min: number) {
    return Math.floor(Math.random() * (max - min) + min);
}

const recomendantionFactory = {
    createRecommendation,
    createRandomNumber
};

export default recomendantionFactory;