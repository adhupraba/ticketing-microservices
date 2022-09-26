import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import jwt from "jsonwebtoken";
import { config } from "../constants";
import request from "supertest";
import { app } from "../app";
import { ITicket, Ticket, TicketDoc } from "../models/ticket";

declare global {
  var getMongoId: () => string;
  var signin: () => string[];
  var createTicket: (attrs: ITicket) => Promise<TicketDoc>;
  var createOrder: (ticketId?: mongoose.Types.ObjectId, cookie?: string[]) => request.Test;
}

jest.mock("../natsWrapper");

jest.setTimeout(10000);

let mongo: MongoMemoryServer | undefined;

global.getMongoId = () => new mongoose.Types.ObjectId().toHexString();

global.signin = () => {
  // build a jwt payload => { id, email }
  const payload = { id: getMongoId(), email: "test@test.com" };

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

global.createTicket = (attrs) => {
  const ticket = Ticket.build(attrs);
  return ticket.save();
};

global.createOrder = (ticketId, cookie) => {
  return request(app)
    .post("/api/orders/")
    .set("Cookie", cookie || global.signin())
    .send({ ticketId });
};

beforeAll(async () => {
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
