const request = require("supertest");
const app = require("../src/app");
const seedDb = require('../scripts/seedDb');
const { Profile } = require('../src/model');

describe("Integrations Test", () => {
    beforeAll(async () => {
        await seedDb();
    });

    describe('/contracts', () => {
        test("It should return 401 when requesting without credentials", async () => {
            await request(app)
                .get("/contracts")
                .expect(401);
        });
        
        test("It should return 200 when requesting with credentials", async () => {
            const profile = await Profile.findOne();
            await request(app)
                .get("/contracts")
                .set('profile_id', profile.id)
                .expect(200);
        });
    });
});