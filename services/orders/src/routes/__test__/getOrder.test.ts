import request from "supertest";
import { app } from "../../app";

it("fetches the order", async () => {
  // CREATE A TICKET
  const ticket = await global.createTicket({ id: global.getMongoId(), title: "ticket 1", price: 10 });

  const u1 = global.signin();
  const u2 = global.signin();

  // CREATE ONE ORDER AS USER 1
  const { body: order } = await global.createOrder(ticket.id, u1).expect(201);

  const { body: u1Order } = await request(app).get(`/api/orders/${order.id}`).set("Cookie", u1).send().expect(200);
  await request(app).get(`/api/orders/${order.id}`).set("Cookie", u2).send().expect(401);

  expect(u1Order.id).toEqual(order.id);
});
