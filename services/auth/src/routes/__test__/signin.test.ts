import request from "supertest";
import { app } from "../../app";

it("returns a 200 on successful signin", async () => {
  await request(app).post("/api/users/signup").send({ email: "test@test.com", password: "12345" }).expect(201);
  await request(app).post("/api/users/signin").send({ email: "test@test.com", password: "12345" }).expect(200);
});

it("fails when a email that does not exist is supplied", async () => {
  await request(app).post("/api/users/signin").send({ email: "test@test.com", password: "12345" }).expect(400);
});

it("fails when incorrect password is supplied", async () => {
  await request(app).post("/api/users/signup").send({ email: "test@test.com", password: "12345" }).expect(201);
  await request(app).post("/api/users/signin").send({ email: "test@test.com", password: "1234579878" }).expect(400);
});
