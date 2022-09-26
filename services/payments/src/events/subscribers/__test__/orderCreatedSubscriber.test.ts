import { OrderCreatedEvent, OrderStatus } from "@trensetickets/packages";
import { Message } from "node-nats-streaming";
import { Order } from "../../../models/order";
import { natsWrapper } from "../../../natsWrapper";
import { OrderCreatedSubscriber } from "../orderCreatedSubscriber";

const setup = async () => {
  const subscriber = new OrderCreatedSubscriber(natsWrapper.client);

  const data: OrderCreatedEvent["data"] = {
    id: global.getMongoId(),
    expiresAt: new Date().toISOString(),
    status: OrderStatus.Created,
    userId: global.getMongoId(),
    version: 0,
    ticket: {
      id: global.getMongoId(),
      price: 20,
    },
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { subscriber, data, msg };
};

it("replicated the order info", async () => {
  const { subscriber, data, msg } = await setup();

  await subscriber.onMessage(data, msg);

  const order = await Order.findById(data.id);

  expect(order?.price).toEqual(data.ticket.price);
});

it("acks the message", async () => {
  const { subscriber, data, msg } = await setup();

  await subscriber.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});
