import request from "supertest";
import { app } from "../../app";

it("can fetch a list of tickets", async () => {
  await global.createTicket("asdafd", 10);
  await global.createTicket("mnbvxcvzxc", 50);
  await global.createTicket("qqweqt", 30);

  const res = await request(app).get("/api/tickets").send().expect(200);

  expect(res.body.length).toEqual(3);
});
