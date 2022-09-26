import request from "supertest";
import { app } from "../../app";

it("fetches orders for a particular user", async () => {
  // CREATE THREE TICKETS
  const t1 = await global.createTicket({ id: global.getMongoId(), title: "ticket 1", price: 10 });
  const t2 = await global.createTicket({ id: global.getMongoId(), title: "ticket 2", price: 50 });
  const t3 = await global.createTicket({ id: global.getMongoId(), title: "ticket 3", price: 30 });

  const u1 = global.signin();
  const u2 = global.signin();

  // CREATE ONE ORDER AS USER 1
  const { body: ord1 } = await global.createOrder(t1.id, u1).expect(201);

  // CREATE TWO ORDERS AS USER 2
  const { body: ord2 } = await global.createOrder(t2.id, u2).expect(201);
  const { body: ord3 } = await global.createOrder(t3.id, u2).expect(201);

  // MAKE REQUEST TO GET ORDERS FOR USER 2
  const { body: ords } = await request(app).get("/api/orders").set("Cookie", u2).send().expect(200);

  // MAKE SURE WE ONLY GOT THE ORDERS FOR USER 2
  expect(ords.length).toEqual(2);
  expect(ords[0].id).toEqual(ord2.id);
  expect(ords[1].id).toEqual(ord3.id);
  expect(ords[0].ticket.id).toEqual(t2.id);
  expect(ords[1].ticket.id).toEqual(t3.id);
});
