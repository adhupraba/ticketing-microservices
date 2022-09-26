import { OrderCreatedEvent, OrderStatus } from "@trensetickets/packages";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../../models/ticket";
import { natsWrapper } from "../../../natsWrapper";
import { OrderCreatedSubscriber } from "../orderCreatedSubscriber";

const setup = async () => {
  const subscriber = new OrderCreatedSubscriber(natsWrapper.client);

  const ticket = Ticket.build({
    title: "concert",
    price: 99,
    userId: global.getMongoId(),
  });
  await ticket.save();

  const data: OrderCreatedEvent["data"] = {
    id: global.getMongoId(),
    expiresAt: new Date().toISOString(),
    status: OrderStatus.Created,
    userId: global.getMongoId(),
    version: 0,
    ticket: {
      id: ticket.id,
      price: ticket.price,
    },
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { subscriber, ticket, data, msg };
};

it("sets the orderId of the ticket", async () => {
  const { data, msg, subscriber, ticket } = await setup();

  await subscriber.onMessage(data, msg);

  const updTicket = await Ticket.findById(ticket.id);

  expect(updTicket!.orderId).toEqual(data.id);
});

it("acks the message", async () => {
  const { data, msg, subscriber, ticket } = await setup();

  await subscriber.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});

it("publishes a ticket updated event", async () => {
  const { data, msg, subscriber, ticket } = await setup();

  await subscriber.onMessage(data, msg);

  expect(natsWrapper.client.publish).toHaveBeenCalled();

  const updTicket = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1]);
  expect(data.id).toEqual(updTicket.orderId);
});
