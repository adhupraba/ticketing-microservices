import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import jwt from "jsonwebtoken";
import { config } from "../constants";
import request from "supertest";
import { app } from "../app";

declare global {
  var getMongoId: () => string;
  var signin: () => string[];
  var createTicket: (title?: string, price?: number, cookie?: string[]) => request.Test;
  var updateTicket: (id: string, title?: string, price?: number, cookie?: string[]) => request.Test;
}

jest.mock("../natsWrapper");

jest.setTimeout(20000);

let mongo: MongoMemoryServer | undefined;

global.getMongoId = () => new mongoose.Types.ObjectId().toHexString();

global.signin = () => {
  // build a jwt payload => { id, email }
  const payload = { id: new mongoose.Types.ObjectId().toHexString(), email: "test@test.com" };

  // create the jwt
  const token = jwt.sign(payload, config.jwtSecret);

  // build session object => { jwt }
  const session = { jwt: token };

  // turn that session into json
  const json = JSON.stringify(session);

  // take json and encode it as base64
  const base64 = Buffer.from(json).toString("base64");

  // return a string that is the cookie with the encoded data
  return [`session=${base64}`];
};

global.createTicket = (title, price, cookie) => {
  return request(app)
    .post("/api/tickets/")
    .set("Cookie", cookie || global.signin())
    .send({ title, price });
};

global.updateTicket = (id, title, price, cookie) => {
  return request(app)
    .put(`/api/tickets/${id}`)
    .set("Cookie", cookie || global.signin())
    .send({ title, price });
};

beforeAll(async () => {
  process.env.JWT_SECRET = "1234";

  mongo = await MongoMemoryServer.create();
  const mongoUri = mongo.getUri();
  await mongoose.connect(mongoUri);
});

beforeEach(async () => {
  jest.clearAllMocks();
  const collections = await mongoose.connection.db.collections();

  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  await mongo?.stop();
  await mongoose.connection.close();
});
