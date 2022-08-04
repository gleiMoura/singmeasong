import { faker, Faker } from "@faker-js/faker";

function createRecommendation(): {name: string, youtubeLink: string} {
    return {
        name: faker.name.findName(), 
        youtubeLink: "https://www.youtube.com/watch?v=Glf5iwea1iE"
    };
};

const recomendantionFactory = {
    createRecommendation,
};

export default recomendantionFactory;