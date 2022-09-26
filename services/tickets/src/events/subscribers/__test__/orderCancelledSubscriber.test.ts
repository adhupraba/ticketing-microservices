import { OrderCancelledEvent } from "@trensetickets/packages";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../../models/ticket";
import { natsWrapper } from "../../../natsWrapper";
import { OrderCancelledSubscriber } from "../orderCancelledSubscriber";

const setup = async () => {
  const subscriber = new OrderCancelledSubscriber(natsWrapper.client);

  const orderId = global.getMongoId();
  const ticket = Ticket.build({
    title: "concert",
    price: 99,
    userId: global.getMongoId(),
  });

  ticket.set({ orderId });
  await ticket.save();

  const data: OrderCancelledEvent["data"] = {
    id: orderId,
    version: 0,
    ticket: {
      id: ticket.id,
    },
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { subscriber, ticket, data, msg, orderId };
};

it("updates the ticket, publishes an event and acks the message", async () => {
  const { data, msg, subscriber, ticket, orderId } = await setup();

  await subscriber.onMessage(data, msg);

  const updTicket = await Ticket.findById(ticket.id);

  expect(updTicket!.orderId).not.toBeDefined();
  expect(msg.ack).toHaveBeenCalled();
  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
