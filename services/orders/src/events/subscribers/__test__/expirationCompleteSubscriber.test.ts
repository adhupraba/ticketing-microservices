import { ExpirationCompleteEvent, OrderStatus } from "@trensetickets/packages";
import { Message } from "node-nats-streaming";
import { Order } from "../../../models/order";
import { Ticket } from "../../../models/ticket";
import { natsWrapper } from "../../../natsWrapper";
import { ExpirationCompleteSubscriber } from "../expirationCompleteSubscriber";

const setup = async () => {
  // CREATE AN INSTANCE OF THE SUBSCRIBER
  const subscriber = new ExpirationCompleteSubscriber(natsWrapper.client);

  const ticket = Ticket.build({
    id: global.getMongoId(),
    title: "hello",
    price: 10,
  });
  await ticket.save();

  const order = Order.build({
    status: OrderStatus.Created,
    ticket,
    expiresAt: new Date(),
    userId: global.getMongoId(),
  });
  await order.save();

  // CREATE A FAKE DATA EVENT
  const data: ExpirationCompleteEvent["data"] = {
    orderId: order.id,
  };

  // CREATE A FAKE MESSAGE OBJECT
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { subscriber, data, msg, order, ticket };
};

it("updates the order status to be cancelled", async () => {
  const { subscriber, data, msg, order, ticket } = await setup();

  // CALL THE onMessage FUNCTION WITH THE DATA OBJECT + MESSAGE OBJECT
  await subscriber.onMessage(data, msg);

  const updOrder = await Order.findById(order.id);

  expect(updOrder?.status).toEqual(OrderStatus.Cancelled);
});

it("emits an OrderCancelled event", async () => {
  const { subscriber, data, msg, order, ticket } = await setup();

  // CALL THE onMessage FUNCTION WITH THE DATA OBJECT + MESSAGE OBJECT
  await subscriber.onMessage(data, msg);

  expect(natsWrapper.client.publish).toHaveBeenCalled();

  const eventData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1]);

  expect(eventData.id).toEqual(order.id);
});

it("acks the message", async () => {
  const { subscriber, data, msg, order, ticket } = await setup();

  // CALL THE onMessage FUNCTION WITH THE DATA OBJECT + MESSAGE OBJECT
  await subscriber.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});
