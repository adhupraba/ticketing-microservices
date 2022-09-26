import { OrderStatus } from "@trensetickets/packages/types";
import request from "supertest";
import { app } from "../../app";
import { Order } from "../../models/order";
import { natsWrapper } from "../../natsWrapper";

it("marks an order as cancelled", async () => {
  // CREATE A TICKET
  const ticket = await global.createTicket({ id: global.getMongoId(), title: "ticket 1", price: 10 });

  const user = global.signin();

  // CREATE ONE ORDER AS USER 1
  const { body: order } = await global.createOrder(ticket.id, user).expect(201);

  await request(app).delete(`/api/orders/${order.id}`).set("Cookie", user).send().expect(204);

  const updOrder = await Order.findById(order.id);

  expect(updOrder?.status).toEqual(OrderStatus.Cancelled);
});

it("emits an order cancelled event", async () => {
  // CREATE A TICKET
  const ticket = await global.createTicket({ id: global.getMongoId(), title: "ticket 1", price: 10 });

  const user = global.signin();

  // CREATE ONE ORDER AS USER 1
  const { body: order } = await global.createOrder(ticket.id, user).expect(201);

  await request(app).delete(`/api/orders/${order.id}`).set("Cookie", user).send().expect(204);

  const updOrder = await Order.findById(order.id);

  expect(updOrder?.status).toEqual(OrderStatus.Cancelled);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
