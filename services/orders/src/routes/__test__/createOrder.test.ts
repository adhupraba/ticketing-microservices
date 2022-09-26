import { OrderStatus } from "@trensetickets/packages/types";
import mongoose from "mongoose";
import { Order } from "../../models/order";
import { natsWrapper } from "../../natsWrapper";

it("returns an error if the ticket does not exist", async () => {
  const ticketId = new mongoose.Types.ObjectId();
  await global.createOrder(ticketId).expect(404);
});

it("returns an error if the ticket is already reserved", async () => {
  const ticket = await global.createTicket({ id: global.getMongoId(), title: "concert", price: 20 });

  const order = Order.build({
    ticket,
    userId: "asfae2r2ersa",
    status: OrderStatus.Created,
    expiresAt: new Date(),
  });
  await order.save();

  await global.createOrder(ticket.id).expect(400);
});

it("reserves a ticket", async () => {
  const ticket = await global.createTicket({ id: global.getMongoId(), title: "concert", price: 20 });
  await global.createOrder(ticket.id).expect(201);
});

it("emits an order created event", async () => {
  const ticket = await global.createTicket({ id: global.getMongoId(), title: "concert", price: 20 });
  await global.createOrder(ticket.id).expect(201);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
