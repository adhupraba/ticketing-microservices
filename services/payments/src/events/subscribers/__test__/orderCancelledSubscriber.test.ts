import { OrderCancelledEvent, OrderStatus } from "@trensetickets/packages";
import { Message } from "node-nats-streaming";
import { Order } from "../../../models/order";
import { natsWrapper } from "../../../natsWrapper";
import { OrderCancelledSubscriber } from "..";
import { Payment } from "../../../models/payment";
import { stripe } from "../../../stripe";

const setup = async () => {
  const subscriber = new OrderCancelledSubscriber(natsWrapper.client);
  const orderId = global.getMongoId();
  const price = 20;

  const intent = await stripe.paymentIntents.create({
    amount: price * 100,
    currency: "INR",
  });

  const order = Order.build({
    id: orderId,
    price,
    status: OrderStatus.Cancelled,
    userId: global.getMongoId(),
    version: 0,
  });
  await order.save();

  const payment = Payment.build({
    orderId: orderId,
    stripeId: intent.id,
  });

  await payment.save();

  const data: OrderCancelledEvent["data"] = {
    id: orderId,
    version: 1,
    ticket: {
      id: global.getMongoId(),
    },
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { subscriber, data, msg, order };
};

it("updates the status of the order", async () => {
  const { subscriber, data, msg, order } = await setup();

  await subscriber.onMessage(data, msg);

  const updOrder = await Order.findById(order.id);

  expect(updOrder?.status).toEqual(OrderStatus.Cancelled);
});

it("acks the message", async () => {
  const { subscriber, data, msg, order } = await setup();

  await subscriber.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});
