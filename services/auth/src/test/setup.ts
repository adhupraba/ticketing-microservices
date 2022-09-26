import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { app } from "../app";

let mongo: MongoMemoryServer | undefined;

declare global {
  var signin: () => Promise<string[]>;
}

global.signin = async () => {
  const email = "test@test.com";
  const password = "12345";

  const response = await request(app).post("/api/users/signup").send({ email, password }).expect(201);
  const cookie = response.get("Set-Cookie");

  return cookie;
};

beforeAll(async () => {
  process.env.JWT_SECRET = "1234";

  mongo = await MongoMemoryServer.create();
  const mongoUri = mongo.getUri();
  await mongoose.connect(mongoUri);
});

beforeEach(async () => {
  const collections = await mongoose.connection.db.collections();

  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  await mongo?.stop();
  await mongoose.connection.close();
});
